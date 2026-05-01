import mongoose from 'mongoose';

const { Schema } = mongoose;

const productFeatureSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    included: {
        type: Boolean,
        default: true,
    },
    quantity: Number,
}, { _id: false });

const productPricingSchema = new Schema({
    cycle: {
        type: String,
        required: true,
    },
    price: {
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
    isDefault: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: false });

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['hosting', 'domain', 'ssl', 'addon', 'service'],
        index: true,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
    },
    icon: {
        type: String,
    },
    
    // Auto-provisioning
    module: {
        type: String,
    },
    serverGroupId: {
        type: Schema.Types.ObjectId,
        ref: 'ServerGroup',
    },
    
    // Pricing
    pricing: [productPricingSchema],
    features: [productFeatureSchema],
    
    // Custom options (for configurable products)
    options: [{
        name: String,
        type: String,
        required: Boolean,
        options: [String],
        priceModifiers: [{
            option: String,
            modifierType: String,
            modifier: Number,
        }],
    }],
    
    // Display
    order: {
        type: Number,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active',
        index: true,
    },
    
    // Parent product (for addons)
    parentProduct: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
    },
    requiresParent: {
        type: Boolean,
        default: false,
    },
    
    // Tax settings
    taxEnabled: {
        type: Boolean,
        default: true,
    },
    
    // Welcome email template
    welcomeEmailTemplateId: {
        type: Schema.Types.ObjectId,
        ref: 'EmailTemplate',
    },
    
    // Metadata
    metadata: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

// Indexes
productSchema.index({ type: 1, status: 1, order: 1 });
productSchema.index({ category: 1, status: 1 });

// Virtual for default pricing
productSchema.virtual('defaultPricing').get(function() {
    if (!this.pricing || !Array.isArray(this.pricing) || this.pricing.length === 0) {
        return null;
    }
    return this.pricing.find(p => p.isDefault) || this.pricing[0];
});

// JSON transform
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);