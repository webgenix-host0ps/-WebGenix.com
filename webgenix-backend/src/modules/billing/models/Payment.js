import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_GATEWAY } from '../../../constants/billing.js';

const { Schema } = mongoose;

const paymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    
    // Invoice/Order references
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
    },
    
    // Payment details
    gateway: {
        type: String,
        enum: Object.values(PAYMENT_GATEWAY),
        required: true,
    },
    gatewayTransactionId: {
        type: String,
    },
    gatewayReferenceId: {
        type: String,
    },
    
    // Amount
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    
    // Status
    status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
        index: true,
    },
    
    // Payment method details (card, etc)
    paymentMethod: {
        type: String,
    },
    cardLast4: {
        type: String,
    },
    cardBrand: {
        type: String,
    },
    
    // Customer info
    customerId: {
        type: String,
    },
    
    // Transaction details
    transactionFee: {
        type: Number,
        default: 0,
    },
    netAmount: {
        type: Number,
    },
    
    // Dates
    processedAt: {
        type: Date,
    },
    failedAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
    
    // Refund info
    refundAmount: {
        type: Number,
        default: 0,
    },
    refundReason: String,
    refundedPaymentId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
    },
    
    // Metadata
    metadata: {
        type: Schema.Types.Mixed,
    },
    
    // Error info
    errorCode: String,
    errorMessage: String,
    
}, {
    timestamps: true,
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ gateway: 1, status: 1 });

// Pre-save to calculate net amount
paymentSchema.pre('save', function(next) {
    if (this.amount && this.transactionFee !== undefined) {
        this.netAmount = this.amount - this.transactionFee;
    }
    next();
});

// JSON transform
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Payment', paymentSchema);