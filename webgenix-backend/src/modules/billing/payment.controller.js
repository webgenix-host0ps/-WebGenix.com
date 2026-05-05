import { asyncHandler } from '../../utils/asyncHandler.js';
import * as razorpayService from './services/razorpay.service.js';
import * as billingService from './services/billing.service.js';
import Payment from './models/Payment.js';
import { ApiError } from '../../utils/ApiError.js';

export const razorpayWebhook = asyncHandler(async (req, res) => {
    const result = await razorpayService.handleRazorpayWebhook(req.body);
    res.json(result);
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
    console.log('[PaymentController] createRazorpayOrder called');
    console.log('[PaymentController] req.userId:', req.userId);
    console.log('[PaymentController] req.body:', req.body);
    
    const { invoiceId } = req.body;
    
    if (!invoiceId) {
        console.error('[PaymentController] Missing invoiceId');
        throw new ApiError(400, 'Invoice ID is required');
    }
    
    if (!req.userId) {
        console.error('[PaymentController] Missing req.userId - auth not working');
        throw new ApiError(401, 'Authentication required');
    }
    
    const result = await razorpayService.createRazorpayOrder(invoiceId, req.userId);
    console.log('[PaymentController] Razorpay order created:', result ? 'Success' : 'Failed');
    
    res.json({
        success: true,
        data: result,
    });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    console.log('[PaymentController] Verifying payment:', { razorpayOrderId, razorpayPaymentId });
    
    try {
        // Validate required fields
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            throw new ApiError(400, 'Missing required payment verification data');
        }
        
        const result = await razorpayService.verifyRazorpayPayment(
            razorpayOrderId, 
            razorpayPaymentId, 
            razorpaySignature
        );
        
        console.log('[PaymentController] Verification result:', { 
            success: result.success, 
            paymentId: result.payment?._id,
            invoiceId: result.payment?.invoiceId 
        });
        
        if (result.success) {
            // Check if payment has invoiceId
            let invoiceId = result.payment.invoiceId;
            if (invoiceId && typeof invoiceId === 'object' && invoiceId._id) {
                invoiceId = invoiceId._id;
            }
            
            if (!invoiceId) {
                console.error('[PaymentController] Payment record missing invoiceId. Payment Data:', JSON.stringify(result.payment, null, 2));
                throw new ApiError(500, 'Payment record incomplete - missing invoice reference in our database');
            }
            
            console.log('[PaymentController] Marking invoice as paid:', invoiceId);
            
            const invoice = await billingService.markInvoiceAsPaid(
                invoiceId,
                {
                    paymentMethod: 'razorpay',
                    transactionId: result.payment.gatewayReferenceId || razorpayPaymentId,
                },
                req
            );
            
            console.log('[PaymentController] Invoice marked as paid successfully');
            
            res.json({
                success: true,
                message: 'Payment successful',
                data: { payment: result.payment, invoice },
            });
        } else {
            throw new ApiError(400, 'Payment verification failed - payment not captured');
        }
    } catch (error) {
        console.error('[PaymentController] Payment verification error:', error.message, error.stack);
        throw error;
    }
});

export const processOfflinePaymentRequest = asyncHandler(async (req, res) => {
    const { invoiceId, method, amount, notes, referenceNumber } = req.body;
    const result = await razorpayService.processOfflinePayment(invoiceId, {
        method,
        amount,
        notes,
        referenceNumber,
    }, req);
    res.json({
        success: true,
        data: result,
        message: 'Payment request submitted. Your payment will be verified by our team.',
    });
});

export const getUserPayments = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        gateway: req.query.gateway,
    };
    const pagination = {
        page: req.query.page,
        limit: req.query.limit,
    };
    
    const result = await razorpayService.getPaymentHistory(req.userId, filters, pagination);
    res.json({
        success: true,
        data: result.payments,
        meta: {
            total: result.total,
            page: result.page,
            pages: result.pages,
        },
    });
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payment = await razorpayService.getPaymentById(id, req.userId);
    res.json({
        success: true,
        data: payment,
    });
});

export const getAllPayments = asyncHandler(async (req, res) => {
    let { page = 1, limit = 20 } = req.query;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);
    
    const query = {};
    if (req.query.userId) query.userId = req.query.userId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.gateway) query.gateway = req.query.gateway;
    
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
        Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .populate('invoiceId', 'invoiceNumber total'),
        Payment.countDocuments(query),
    ]);
    
    res.json({
        success: true,
        data: payments,
        meta: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    });
});

export const adminRefund = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    const payment = await razorpayService.requestRefund(id, amount, reason, req);
    
    if (payment.invoiceId) {
        await (await import('../models/Invoice.js')).default.findByIdAndUpdate(payment.invoiceId, {
            status: 'refunded',
            refundedAt: new Date(),
            refundAmount: amount,
        });
    }
    
    res.json({
        success: true,
        data: payment,
        message: 'Refund processed successfully',
    });
});