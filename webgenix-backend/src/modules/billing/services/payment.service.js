import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { ApiError } from '../../../utils/ApiError.js';
import { PAYMENT_STATUS, PAYMENT_GATEWAY } from '../../../constants/billing.js';
import { logAction } from '../../../services/audit.service.js';
import { env } from '../../../config/env.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const createStripePaymentIntent = async (invoiceId, userId) => {
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
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(invoice.amountDue * 100), // Convert to paise
        currency: invoice.currency.toLowerCase(),
        metadata: {
            invoiceId: invoice._id.toString(),
            userId: userId.toString(),
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });
    
    // Create payment record
    const payment = await Payment.create({
        userId,
        invoiceId: invoice._id,
        gateway: PAYMENT_GATEWAY.STRIPE,
        gatewayTransactionId: paymentIntent.id,
        amount: invoice.amountDue,
        currency: invoice.currency,
        status: PAYMENT_STATUS.PENDING,
    });
    
    return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
    };
};

export const handleStripeWebhook = async (payload, signature) => {
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
        throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
    }
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handleSuccessfulPayment(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handleFailedPayment(event.data.object);
            break;
        case 'charge.refunded':
            await handleRefund(event.data.object);
            break;
    }
    
    return { received: true };
};

export const handleSuccessfulPayment = async (paymentIntent) => {
    const { invoiceId, userId } = paymentIntent.metadata;
    
    const payment = await Payment.findOne({
        gatewayTransactionId: paymentIntent.id,
    });
    
    if (!payment) return;
    
    payment.status = PAYMENT_STATUS.COMPLETED;
    payment.gatewayReferenceId = paymentIntent.id;
    payment.processedAt = new Date();
    payment.paymentMethod = paymentIntent.payment_method_types[0];
    
    // Get card details if available
    if (paymentIntent.payment_method_details?.card) {
        payment.cardLast4 = paymentIntent.payment_method_details.card.last4;
        payment.cardBrand = paymentIntent.payment_method_details.card.brand;
    }
    
    payment.transactionFee = paymentIntent.application_fee_amount || 0;
    await payment.save();
    
    // Update invoice status will be handled by the controller that calls this
    await logAction({
        userId,
        action: 'payment.completed',
        metadata: { 
            paymentId: payment._id, 
            invoiceId, 
            amount: payment.amount 
        },
    });
};

export const handleFailedPayment = async (paymentIntent) => {
    const payment = await Payment.findOne({
        gatewayTransactionId: paymentIntent.id,
    });
    
    if (!payment) return;
    
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failedAt = new Date();
    payment.errorMessage = paymentIntent.last_payment_error?.message;
    await payment.save();
};

export const handleRefund = async (charge) => {
    const payment = await Payment.findOne({
        gatewayTransactionId: charge.payment_intent,
    });
    
    if (!payment) return;
    
    payment.refundedAt = new Date();
    payment.refundAmount = charge.amount_refunded / 100;
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

export const createPayPalOrder = async (invoiceId, userId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        throw new ApiError(404, 'Invoice not found');
    }
    
    if (invoice.userId.toString() !== userId.toString()) {
        throw new ApiError(403, 'Access denied');
    }
    
    // PayPal order creation would go here
    // This is a placeholder for PayPal integration
    
    const payment = await Payment.create({
        userId,
        invoiceId: invoice._id,
        gateway: PAYMENT_GATEWAY.PAYPAL,
        amount: invoice.amountDue,
        currency: invoice.currency,
        status: PAYMENT_STATUS.PENDING,
    });
    
    return {
        paymentId: payment._id,
        // PayPal specific fields would be returned here
    };
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
    
    if (payment.gateway !== PAYMENT_GATEWAY.STRIPE) {
        throw new ApiError(400, 'Refund not supported for this payment method');
    }
    
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
        payment_intent: payment.gatewayTransactionId,
        amount: Math.round((amount || payment.amount) * 100),
    });
    
    payment.refundedAt = new Date();
    payment.refundAmount = (amount || payment.amount);
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