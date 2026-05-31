import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { ApiError } from '../../../utils/ApiError.js';
import { PAYMENT_STATUS, PAYMENT_GATEWAY } from '../../../constants/billing.js';
import { logAction } from '../../../services/audit.service.js';
import { env } from '../../../config/env.js';

let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (razorpayInstance) return razorpayInstance;
    
    // Debug: Check if credentials exist
    console.log('[Razorpay] Checking credentials...');
    console.log('[Razorpay] KEY_ID exists:', !!env.RAZORPAY_KEY_ID);
    console.log('[Razorpay] KEY_SECRET exists:', !!env.RAZORPAY_KEY_SECRET);
    
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        console.error('[Razorpay] Missing credentials! KEY_ID:', env.RAZORPAY_KEY_ID ? '***' : 'MISSING', 'SECRET:', env.RAZORPAY_KEY_SECRET ? '***' : 'MISSING');
        throw new ApiError(500, 'Razorpay credentials not configured. Please check .env file.');
    }
    
    console.log('[Razorpay] Initializing with key:', env.RAZORPAY_KEY_ID.substring(0, 10) + '...');
    
    razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
    });
    return razorpayInstance;
};

export const createRazorpayOrder = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    
    if (invoice.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }
    
    if (invoice.status === 'paid') {
        throw new ApiError(400, 'Invoice already paid');
    }
    
    // Create order in Razorpay (amount in paise)
    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(invoice.amountDue * 100),
        currency: invoice.currency === 'INR' ? 'INR' : 'INR',
        receipt: `INV-${invoice.invoiceNumber}`,
        notes: {
            invoiceId: invoice._id.toString(),
            userId: userId.toString(),
        },
    });
    
    // Create payment record
    const payment = await Payment.create({
        userId,
        invoiceId: invoice._id,
        gateway: PAYMENT_GATEWAY.RAZORPAY,
        gatewayTransactionId: razorpayOrder.id,
        amount: invoice.amountDue,
        currency: invoice.currency,
        status: PAYMENT_STATUS.PENDING,
    });
    
    return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id,
        key: env.RAZORPAY_KEY_ID, // Return key for frontend
    };
};

export const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        console.log('[Razorpay] Starting verification:', { razorpayOrderId, razorpayPaymentId });
        
        // Verify signature first - this confirms Razorpay sent this
        const crypto = await import('crypto');
        const generatedSignature = crypto
            .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');
        
        console.log('[Razorpay] Signature check:', { 
            generated: generatedSignature.substring(0, 10) + '...', 
            received: razorpaySignature.substring(0, 10) + '...',
            match: generatedSignature === razorpaySignature 
        });
        
        if (generatedSignature !== razorpaySignature) {
            throw new ApiError(400, 'Invalid payment signature');
        }
        
        // Find our payment record by order ID
        console.log('[Razorpay] Finding payment record in DB...');
        const payment = await Payment.findOne({
            gatewayTransactionId: razorpayOrderId,
        });
        
        if (!payment) {
            console.error('[Razorpay] Payment record not found for order:', razorpayOrderId);
            throw new ApiError(404, 'Payment not found in our records');
        }
        
        console.log('[Razorpay] Found payment record:', { 
            id: payment._id, 
            invoiceId: payment.invoiceId,
            currentStatus: payment.status,
            amount: payment.amount
        });
        
        // Get payment details from Razorpay
        const razorpay = getRazorpayInstance();
        console.log('[Razorpay] Fetching payment from Razorpay...');
        let razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
        console.log('[Razorpay] Razorpay payment status:', razorpayPayment.status);
        
        // *** KEY FIX ***
        // In test mode and many live configs, Razorpay returns 'authorized' (not 'captured').
        // We must explicitly capture the payment to move money. If already captured, skip.
        if (razorpayPayment.status === 'authorized') {
            console.log('[Razorpay] Payment is authorized, capturing now...');
            try {
                razorpayPayment = await razorpay.payments.capture(
                    razorpayPaymentId,
                    Math.round(payment.amount * 100), // amount in paise
                    payment.currency || 'INR'
                );
                console.log('[Razorpay] Capture successful, new status:', razorpayPayment.status);
            } catch (captureErr) {
                console.error('[Razorpay] Capture failed:', captureErr.message);
                // If capture fails with 'payment already captured', treat as success
                if (captureErr.error?.code === 'BAD_REQUEST_ERROR' && captureErr.error?.description?.includes('already captured')) {
                    console.log('[Razorpay] Payment was already captured, proceeding...');
                    razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
                } else {
                    throw new ApiError(500, `Payment capture failed: ${captureErr.message}`);
                }
            }
        }
        
        // Accept 'captured' as the final success state
        if (razorpayPayment.status === 'captured') {
            console.log('[Razorpay] Payment captured, updating record...');
            
            payment.status = PAYMENT_STATUS.COMPLETED;
            payment.gatewayReferenceId = razorpayPaymentId;
            payment.processedAt = new Date();
            
            if (razorpayPayment.method) {
                payment.paymentMethod = razorpayPayment.method;
            }
            
            if (razorpayPayment.card) {
                payment.cardLast4 = razorpayPayment.card.last4;
                payment.cardBrand = razorpayPayment.card.network;
            }
            
            // Use actual fee from Razorpay if available, else estimate
            payment.transactionFee = razorpayPayment.fee 
                ? razorpayPayment.fee / 100 
                : Math.round(payment.amount * 0.02 * 100) / 100;
            await payment.save();
            
            // Convert to plain object and ensure invoiceId is present
            const paymentObj = payment.toObject();
            console.log('[Razorpay] Payment updated successfully, invoiceId:', paymentObj.invoiceId);
            
            return { success: true, payment: paymentObj };
        }
        
        // Payment is in a non-success state (failed, refunded, etc.)
        console.log('[Razorpay] Payment not captured, final status:', razorpayPayment.status);
        payment.status = PAYMENT_STATUS.FAILED;
        payment.failedAt = new Date();
        payment.errorMessage = razorpayPayment.error_description || `Payment status: ${razorpayPayment.status}`;
        await payment.save();
        
        return { success: false, payment: payment.toObject() };
    } catch (error) {
        console.error('[Razorpay] Verification error details:', {
            message: error.message,
            stack: error.stack,
            razorpayOrderId,
            razorpayPaymentId
        });
        throw error;
    }
};

export const processOfflinePayment = async (invoiceId, paymentData, req) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    
    if (invoice.userId.toString() !== req.userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }
    
    const payment = await Payment.create({
        userId: req.userId,
        invoiceId: invoice._id,
        gateway: PAYMENT_GATEWAY.OFFLINE,
        amount: paymentData.amount || invoice.amountDue,
        currency: invoice.currency,
        paymentMethod: paymentData.method || 'bank_transfer',
        status: PAYMENT_STATUS.PENDING,
        metadata: {
            notes: paymentData.notes,
            referenceNumber: paymentData.referenceNumber,
        },
    });
    
    return payment;
};

export const getPaymentById = async (paymentId, userId) => {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, 'Payment not found');
    }
    
    if (payment.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }
    
    return payment;
};

export const getPaymentHistory = async (userId, filters, pagination) => {
    let { page = 1, limit = 20 } = pagination;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    
    const query = { userId };
    if (filters.status) query.status = filters.status;
    if (filters.gateway) query.gateway = filters.gateway;
    
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
        Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('invoiceId', 'invoiceNumber total'),
        Payment.countDocuments(query),
    ]);
    
    return {
        payments,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const requestRefund = async (paymentId, amount, reason, req) => {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, 'Payment not found');
    }
    
    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
        throw new ApiError(400, 'Payment cannot be refunded');
    }
    
    if (payment.gateway !== PAYMENT_GATEWAY.RAZORPAY) {
        throw new ApiError(400, 'Refund not supported for this payment method');
    }
    
    // Process refund through Razorpay
    const razorpay = getRazorpayInstance();
    const refund = await razorpay.payments.refund(payment.gatewayReferenceId, {
        amount: Math.round((amount || payment.amount) * 100),
        notes: {
            reason: reason || 'Customer requested refund',
        },
    });
    
    payment.refundedAt = new Date();
    payment.refundAmount = refund.amount / 100;
    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundReason = reason;
    await payment.save();
    
    await logAction({
        userId: req.userId,
        action: 'payment.refunded',
        metadata: { paymentId: payment._id, amount: payment.refundAmount },
        req,
    });
    
    return payment;
};
