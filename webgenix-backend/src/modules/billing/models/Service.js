import mongoose from 'mongoose';
import { BILLING_CYCLE_MONTHS } from '../../../constants/billing.js';

const { Schema } = mongoose;

const serviceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    
    // Product info
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productType: {
        type: String,
        required: true,
    },
    
    // Configuration
    configuration: {
        type: Schema.Types.Mixed,
    },
    
    // Domain
    domain: {
        type: String,
    },
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'cancelled', 'terminated'],
        default: 'pending',
        index: true,
    },
    
    // Billing
    cycle: {
        type: String,
    },
    registrationPeriod: {
        type: Number,
        default: 1,
    },
    
    // Pricing at time of purchase
    firstPaymentAmount: {
        type: Number,
        required: true,
    },
    recurringAmount: {
        type: Number,
        required: true,
    },
    setupFee: {
        type: Number,
        default: 0,
    },
    cancellationFee: {
        type: Number,
        default: 0,
    },
    
    // Next due date for renewal
    nextDueDate: {
        type: Date,
        index: true,
    },
    nextInvoiceDate: {
        type: Date,
    },
    
    // Auto-renewal
    autoRenew: {
        type: Boolean,
        default: true,
    },
    
    // Provisioning
    module: {
        type: String,
    },
    serverId: {
        type: Schema.Types.ObjectId,
        ref: 'Server',
    },
    serverGroupId: {
        type: Schema.Types.ObjectId,
        ref: 'ServerGroup',
    },
    hostingAccountId: String,
    username: {
        type: String,
    },
    password: {
        type: String,
        select: false,
    },
    provisionDate: {
        type: Date,
    },
    welcomeEmailSent: {
        type: Date,
    },
    
    // Upgrade info
    upgradeCredits: {
        type: Number,
        default: 0,
    },
    upgradeFromServiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
    },
    
    // Cancellation
    cancellationRequestedAt: {
        type: Date,
    },
    cancellationType: {
        type: String,
        enum: ['immediate', 'end_of_billing_period'],
    },
    cancellationReason: String,
    cancelledAt: Date,
    
    // Termination
    terminationRequestedAt: Date,
    terminatedAt: Date,
    terminationReason: String,
    
    // Addons
    addons: [{
        addonId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        name: String,
        status: {
            type: String,
            default: 'active',
        },
        nextDueDate: Date,
        recurringAmount: Number,
    }],
    
    // Notes
    notes: String,
    adminNotes: String,
    
    // Related order/invoice
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
    },
    initialInvoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    
}, {
    timestamps: true,
});

// Indexes
serviceSchema.index({ userId: 1, status: 1 });
serviceSchema.index({ userId: 1, nextDueDate: 1 });
serviceSchema.index({ domain: 1 });
serviceSchema.index({ productId: 1, status: 1 });

// Calculate next due date based on cycle
serviceSchema.methods.calculateNextDueDate = function() {
    if (!this.nextDueDate) {
        this.nextDueDate = new Date();
    }
    const months = BILLING_CYCLE_MONTHS[this.cycle] || 1;
    this.nextDueDate = new Date(this.nextDueDate);
    this.nextDueDate.setMonth(this.nextDueDate.getMonth() + months);
    return this.nextDueDate;
};

// Check if service is overdue
serviceSchema.virtual('isOverdue').get(function() {
    return this.status === 'active' && 
           this.nextDueDate && 
           new Date() > this.nextDueDate;
});

// JSON transform
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

export default mongoose.model('Service', serviceSchema);