import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * TldPricing — defines registration, renewal, and transfer pricing per TLD.
 */
const tldPricingSchema = new Schema({
    tld: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, // e.g. 'com', 'in', 'org'
    },
    registerPrice: {
        type: Number,
        required: true,
    },
    renewPrice: {
        type: Number,
        required: true,
    },
    transferPrice: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    minYears: {
        type: Number,
        default: 1,
    },
    maxYears: {
        type: Number,
        default: 10,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    promoPrice: Number, // optional discounted price
    promoEndsAt: Date,
}, {
    timestamps: true,
});

export default mongoose.model('TldPricing', tldPricingSchema);
