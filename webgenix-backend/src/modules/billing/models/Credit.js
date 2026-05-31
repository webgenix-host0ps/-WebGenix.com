import mongoose from 'mongoose';

const { Schema } = mongoose;

const creditBalanceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    pendingBalance: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const creditTransactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    
    // Transaction type
    type: {
        type: String,
        enum: ['credit_added', 'credit_used', 'refund', 'adjustment', 'expired'],
        required: true,
    },
    
    // Amount
    amount: {
        type: Number,
        required: true,
    },
    balanceBefore: {
        type: Number,
        required: true,
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    
    // Reference
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
    },
    
    // Description
    description: {
        type: String,
    },
    
    // Admin who made the adjustment
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    
    // For pending credits
    isPending: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
    },
    executedAt: {
        type: Date,
    },
    
}, {
    timestamps: true,
});

// Indexes
creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ invoiceId: 1 });

export const CreditBalance = mongoose.model('CreditBalance', creditBalanceSchema);
export const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);