import express, { Router } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import Order from '../../modules/billing/models/Order.js';
import Payment from '../../modules/billing/models/Payment.js';
import { markInvoiceAsPaid } from '../../modules/billing/services/billing.service.js';

const router = Router();

// Razorpay webhook handler
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    
    const shasum = crypto.createHmac('sha256', secret);
    const payloadString = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    shasum.update(payloadString);
    const digest = shasum.digest('hex');
    
    if (digest === req.headers['x-razorpay-signature']) {
        const event = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
        
        try {
            switch(event.event) {
                case 'payment.captured': {
                    const { order_id, id: paymentId } = event.payload.payment.entity;
                    
                    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': order_id });
                    if (order) {
                        order.status = 'completed';
                        order.paymentStatus = 'paid';
                        if (order.paymentDetails) {
                            order.paymentDetails.razorpayPaymentId = paymentId;
                        }
                        await order.save();
                        
                        if (order.invoiceId) {
                            await markInvoiceAsPaid(
                                order.invoiceId,
                                {
                                    paymentMethod: 'razorpay',
                                    transactionId: paymentId,
                                },
                                { userId: order.userId }
                            );
                        }

                        // Record payment
                        await Payment.create({
                            invoiceId: order.invoiceId,
                            orderId: order._id,
                            userId: order.userId,
                            amount: event.payload.payment.entity.amount / 100,
                            currency: event.payload.payment.entity.currency.toUpperCase(),
                            gateway: 'razorpay',
                            status: 'completed',
                            gatewayTransactionId: paymentId,
                            gatewayReferenceId: order_id,
                            paymentMethod: event.payload.payment.entity.method
                        });
                    }
                    break;
                }
                case 'payment.failed': {
                    const { order_id } = event.payload.payment.entity;
                    if (!order_id) break;
                    const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': order_id });
                    if (order) {
                        order.paymentStatus = 'failed';
                        await order.save();
                    }
                    break;
                }
                case 'subscription.charged': {
                    // Handle recurring subscription payments
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
