import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * TaxRule model — defines tax rates (e.g. GST) for different states/jurisdictions.
 * Critical for India GST compliance.
 */
const taxRuleSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Tax name is required (e.g. CGST, SGST, IGST)'],
        trim: true,
    },
    rate: {
        type: Number,
        required: [true, 'Tax rate percentage is required'],
        min: 0,
    },
    jurisdiction: {
        type: String,
        required: [true, 'Jurisdiction (state code or Country) is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['exclusive', 'inclusive'],
        default: 'exclusive',
    },
    hsnCode: {
        type: String,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // Optional array of product IDs this rule applies to. If empty, applies to all.
    applicableProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
}, {
    timestamps: true,
});

export default mongoose.model('TaxRule', taxRuleSchema);
