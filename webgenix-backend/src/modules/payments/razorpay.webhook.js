import express, { Router } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import Order from '../../modules/billing/models/Order.js';
import Invoice from '../../modules/billing/models/Invoice.js';
import Payment from '../../modules/billing/models/Payment.js';

const router = Router();

// Razorpay webhook handler
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    
    const shasum = crypto.createHmac('sha256', secret);
    const payloadString = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    shasum.update(payloadString);
    const digest = shasum.digest('hex');
    
    if (digest === req.headers['x-razorpay-signature']) {
        // Process webhook
        const event = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
        console.log('Razorpay webhook received:', event.event);
        
        try {
            // Handle different event types
            switch(event.event) {
                case 'payment.captured': {
                    const { order_id, id: paymentId } = event.payload.payment.entity;
                    
                    // Find and update order
                    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': order_id });
                    if (order) {
                        order.status = 'completed';
                        order.paymentStatus = 'paid';
                        order.paymentDetails.razorpayPaymentId = paymentId;
                        await order.save();
                        
                        // Update associated invoice
                        if (order.invoiceId) {
                            await Invoice.findByIdAndUpdate(order.invoiceId, {
                                status: 'paid',
                                paidAt: new Date(),
                                paymentMethod: 'razorpay',
                                transactionId: paymentId
                            });
                        }
                        
                        // Record payment
                        await Payment.create({
                            invoiceId: order.invoiceId,
                            orderId: order._id,
                            userId: order.user,
                            amount: event.payload.payment.entity.amount / 100, // Convert from paise
                            currency: event.payload.payment.entity.currency.toUpperCase(),
                            gateway: 'razorpay',
                            status: 'completed',
                            gatewayTransactionId: paymentId,
                            gatewayReferenceId: order_id,
                            paymentMethod: event.payload.payment.entity.method
                        });
                        
                        console.log(`Payment captured for order ${order._id}`);
                    }
                    break;
                }
                case 'payment.failed': {
                    const { order_id } = event.payload.payment.entity;
                    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': order_id });
                    if (order) {
                        order.paymentStatus = 'failed';
                        await order.save();
                        console.log(`Payment failed for order ${order._id}`);
                    }
                    break;
                }
                case 'subscription.charged': {
                    // Handle recurring subscription payments
                    console.log('Subscription charged:', event.payload.subscription.entity);
                    break;
                }
            }
            
            res.json({ status: 'ok' });
        } catch (error) {
            console.error('Webhook processing error:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    } else {
        res.status(400).send('Invalid signature');
    }
});

export default router;
