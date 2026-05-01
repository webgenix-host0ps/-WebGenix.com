import mongoose from 'mongoose';
import Counter from '../../../models/Counter.js'; // Ensure Counter is registered

const { Schema } = mongoose;

const orderItemSchema = new Schema({
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
    
    // Pricing at time of order
    cycle: {
        type: String,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    setupFee: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    
    // Domain (if applicable)
    domain: {
        type: String,
    },
    registrationPeriod: {
        type: Number,
    },
    
    // Addons
    addons: [{
        addonId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        name: String,
        price: Number,
    }],
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'cancelled', 'terminated'],
        default: 'pending',
    },
    
    // Service link
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
    },
    
    // Dates
    serviceStartDate: Date,
    serviceNextDueDate: Date,
    cancellationRequestedAt: Date,
    cancelledAt: Date,
    terminationDate: Date,
    
    // Notes
    notes: String,
}, { _id: true });

const orderSchema = new Schema({
    orderNumber: {
        type: String,
        unique: true,
        index: true,
        sparse: true, // Allows null/undefined values before generation
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    
    // Order details
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'fraud', 'refunded'],
        default: 'pending',
        index: true,
    },
    
    items: [orderItemSchema],
    
    // Financials
    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    discountCode: {
        type: String,
    },
    tax: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    
    // Payment
    paymentMethod: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'refunded', 'failed'],
        default: 'pending',
    },
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
    },
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    transactionId: {
        type: String,
    },
    
    // Client info at time of order
    clientIp: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    
    // Notes
    notes: String,
    adminNotes: String,
    
    // Affiliate
    affiliateId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    affiliateCommission: {
        type: Number,
    },
    
    // Refund info
    refundAmount: {
        type: Number,
        default: 0,
    },
    refundedAt: {
        type: Date,
    },
    refundReason: String,
    
    // History
    history: [{
        date: { type: Date, default: Date.now },
        status: String,
        description: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
    }],
    
}, {
    timestamps: true,
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.productId': 1 });

// Pre-save to generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        try {
            // Get or create counter
            let counter = await mongoose.model('Counter').findById('order');
            if (!counter) {
                counter = await mongoose.model('Counter').create({
                    _id: 'order',
                    seq: 0
                });
            }
            counter.seq += 1;
            await counter.save();
            
            this.orderNumber = `ORD-${new Date().getFullYear()}-${counter.seq.toString().padStart(6, '0')}`;
        } catch (err) {
            console.error('Failed to generate order number:', err);
            // Fallback: generate with timestamp
            this.orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
        }
    }
    next();
});

// Calculate totals method
orderSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal - this.discount + this.tax;
    return this;
};

// JSON transform
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model('Order', orderSchema);