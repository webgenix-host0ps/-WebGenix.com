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
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new ApiError(500, 'Razorpay credentials not configured');
    }
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
    // Verify signature
    const crypto = await import('crypto');
    const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
    
    if (generatedSignature !== razorpaySignature) {
        throw new ApiError(400, 'Invalid payment signature');
    }
    
    // Get payment details from Razorpay
    const razorpay = getRazorpayInstance();
    const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
    
    // Find our payment record
    const payment = await Payment.findOne({
        gatewayTransactionId: razorpayOrderId,
    });
    
    if (!payment) {
        throw new ApiError(404, 'Payment not found');
    }
    
    if (razorpayPayment.status === 'captured') {
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
        
        // Calculate fee (Razorpay typically charges 2%)
        payment.transactionFee = Math.round(payment.amount * 0.02 * 100) / 100;
        await payment.save();
        
        return { success: true, payment };
    }
    
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failedAt = new Date();
    payment.errorMessage = razorpayPayment.error_description || 'Payment failed';
    await payment.save();
    
    return { success: false, payment };
};

export const handleRazorpayWebhook = async (payload) => {
    const event = payload;
    
    switch (event.event) {
        case 'payment.captured':
            await handleSuccessfulPayment(event.payload.payment);
            break;
        case 'payment.failed':
            await handleFailedPayment(event.payload.payment);
            break;
        case 'payment.refunded':
            await handleRefund(event.payload.payment);
            break;
    }
    
    return { received: true };
};

const handleSuccessfulPayment = async (razorpayPayment) => {
    const payment = await Payment.findOne({
        gatewayTransactionId: razorpayPayment.order_id,
    });
    
    if (!payment) return;
    
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.gatewayReferenceId = razorpayPayment.id;
    payment.processedAt = new Date();
    payment.paymentMethod = razorpayPayment.method;
    
    if (razorpayPayment.card) {
        payment.cardLast4 = razorpayPayment.card.last4;
        payment.cardBrand = razorpayPayment.card.network;
    }
    
    payment.transactionFee = (razorpayPayment.fees || 0) / 100;
    await payment.save();
};

const handleFailedPayment = async (razorpayPayment) => {
    const payment = await Payment.findOne({
        gatewayTransactionId: razorpayPayment.order_id,
    });
    
    if (!payment) return;
    
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failedAt = new Date();
    payment.errorMessage = razorpayPayment.error_description;
    await payment.save();
};

const handleRefund = async (razorpayPayment) => {
    const payment = await Payment.findOne({
        gatewayReferenceId: razorpayPayment.id,
    });
    
    if (!payment) return;
    
    payment.refundedAt = new Date();
    payment.refundAmount = razorpayPayment.amount / 100;
    payment.status = PAYMENT_STATUS.REFUNDED;
    await payment.save();
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
