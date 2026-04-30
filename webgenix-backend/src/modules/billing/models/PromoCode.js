import mongoose from 'mongoose';

const { Schema } = mongoose;

const promoCodeSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    
    // Limits
    maxUses: {
        type: Number,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    maxUsesPerClient: {
        type: Number,
        default: 1,
    },
    
    // Client restrictions
    allowedClientRoles: [{
        type: String,
    }],
    allowedUserIds: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    excludedUserIds: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    
    // Product restrictions
    appliesTo: {
        type: String,
        enum: ['all', 'products', 'categories', 'specific'],
        default: 'all',
    },
    productIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
    category: String,
    
    // Pricing cycle restrictions
    allowedCycles: [{
        type: String,
    }],
    
    // Date restrictions
    validFrom: {
        type: Date,
    },
    validUntil: {
        type: Date,
    },
    
    // Status
    isRecurring: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    
    // Description
    description: String,
    terms: String,
    
    // First order only
    firstOrderOnly: {
        type: Boolean,
        default: false,
    },
    
    // Minimum order amount
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    
}, {
    timestamps: true,
});

// Index
promoCodeSchema.index({ code: 1, isActive: 1 });

// Validate dates
promoCodeSchema.pre('save', function(next) {
    if (this.validFrom && this.validUntil && this.validFrom > this.validUntil) {
        return next(new Error('Valid from date must be before valid until date'));
    }
    next();
});

// Check if valid
promoCodeSchema.methods.isValid = function(userId = null, orderAmount = 0) {
    if (!this.isActive) return { valid: false, reason: 'Promo code is inactive' };
    
    const now = new Date();
    if (this.validFrom && now < this.validFrom) return { valid: false, reason: 'Promo code is not yet valid' };
    if (this.validUntil && now > this.validUntil) return { valid: false, reason: 'Promo code has expired' };
    if (this.maxUses && this.usedCount >= this.maxUses) return { valid: false, reason: 'Promo code usage limit reached' };
    if (this.minOrderAmount && orderAmount < this.minOrderAmount) return { valid: false, reason: `Minimum order amount of ₹${this.minOrderAmount} required` };
    
    return { valid: true };
};

// Calculate discount
promoCodeSchema.methods.calculateDiscount = function(amount, cycle = null) {
    if (this.type === 'percentage') {
        return (amount * this.value) / 100;
    }
    return Math.min(this.value, amount);
};

// JSON transform
promoCodeSchema.set('toJSON', { virtuals: true });
promoCodeSchema.set('toObject', { virtuals: true });

export default mongoose.model('PromoCode', promoCodeSchema);