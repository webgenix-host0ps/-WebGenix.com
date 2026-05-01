import mongoose from 'mongoose';
import { INVOICE_STATUS, INVOICE_TYPE } from '../../../constants/billing.js';
import Counter from '../../../models/Counter.js';

const { Schema } = mongoose;

const invoiceItemSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
    },
    domain: {
        type: String,
    },
    periodStart: {
        type: Date,
    },
    periodEnd: {
        type: Date,
    },
    lineItemType: {
        type: String,
        enum: ['product', 'service', 'domain', 'setup', 'addon', 'refund', 'credit'],
    },
}, { _id: true });

const invoiceSchema = new Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        index: true,
        sparse: true, // Allows null/undefined before generation
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    
    // Invoice details
    type: {
        type: String,
        enum: Object.values(INVOICE_TYPE),
        default: INVOICE_TYPE.NEW,
    },
    status: {
        type: String,
        enum: Object.values(INVOICE_STATUS),
        default: INVOICE_STATUS.DRAFT,
        index: true,
    },
    
    // Related orders
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
    },
    
    // Billing period
    dateIssued: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
    },
    datePaid: {
        type: Date,
    },
    
    // Items
    items: [invoiceItemSchema],
    
    // Financials
    subtotal: {
        type: Number,
        required: true,
        default: 0,
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
    taxRate: {
        type: Number,
        default: 0,
    },
    taxName: {
        type: String,
    },
    total: {
        type: Number,
        required: true,
        default: 0,
    },
    creditApplied: {
        type: Number,
        default: 0,
    },
    creditBalance: {
        type: Number,
        default: 0,
    },
    amountPaid: {
        type: Number,
        default: 0,
    },
    amountDue: {
        type: Number,
        required: true,
        default: 0,
    },
    
    // Currency
    currency: {
        type: String,
        default: 'INR',
    },
    
    // Payment info
    paymentMethod: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    
    // Notes
    notes: {
        type: String,
    },
    terms: {
        type: String,
    },
    
    // For recurring invoices
    recurringInvoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    nextDueDate: {
        type: Date,
    },
    recurringEndDate: {
        type: Date,
    },
    
    // Partial payment
    paymentAttempts: {
        type: Number,
        default: 0,
    },
    lastPaymentAttempt: {
        type: Date,
    },
    
    // Refund info
    refundAmount: {
        type: Number,
        default: 0,
    },
    refundedAt: {
        type: Date,
    },
    
    // History
    history: [{
        date: { type: Date, default: Date.now },
        action: String,
        description: String,
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
    }],
    
}, {
    timestamps: true,
});

// Indexes
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dateIssued: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ orderId: 1 });

// Pre-save to generate invoice number
invoiceSchema.pre('save', async function(next) {
    if (this.isNew && !this.invoiceNumber) {
        try {
            // Atomic counter update
            const counter = await mongoose.model('Counter').findByIdAndUpdate(
                'invoice',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            this.invoiceNumber = `INV-${new Date().getFullYear()}-${counter.seq.toString().padStart(6, '0')}`;
        } catch (err) {
            console.error('Failed to generate invoice number:', err);
            // Fallback: generate with timestamp
            this.invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
        }
    }
    next();
});

// Calculate totals method
invoiceSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal - this.discount + this.tax;
    this.amountDue = this.total - this.amountPaid - this.creditApplied;
    return this;
};

// JSON transform
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
    return this.status === INVOICE_STATUS.UNPAID && 
           this.dueDate && 
           new Date() > this.dueDate;
});

export default mongoose.model('Invoice', invoiceSchema);