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
    const { invoiceId } = req.body;
    const result = await razorpayService.createRazorpayOrder(invoiceId, req.userId);
    res.json({
        success: true,
        data: result,
    });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const result = await razorpayService.verifyRazorpayPayment(
        razorpayOrderId, 
        razorpayPaymentId, 
        razorpaySignature
    );
    
    if (result.success) {
        const invoice = await billingService.markInvoiceAsPaid(
            result.payment.invoiceId,
            {
                paymentMethod: 'razorpay',
                transactionId: result.payment.gatewayReferenceId,
            },
            req
        );
        
        res.json({
            success: true,
            message: 'Payment successful',
            data: { payment: result.payment, invoice },
        });
    } else {
        throw new ApiError(400, 'Payment verification failed');
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