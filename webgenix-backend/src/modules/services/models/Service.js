import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
        type: String,
        required: true,
        enum: ['web-development', 'web-security', 'package'],
    },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    icon: { type: String, default: 'code' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    pricingLabel: { type: String, default: '' },
    features: [{ name: String, value: String, included: Boolean }],
    deliverables: [String],
    techStack: [String],
    status: { type: String, enum: ['active', 'hidden', 'coming-soon'], default: 'active' },
    order: { type: Number, default: 0 },
    recommended: { type: Boolean, default: false },
    badge: { type: String, default: '' },
}, { timestamps: true, collection: 'svc_services' });

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ type: 1, status: 1 });

export default mongoose.model('svc_Services', serviceSchema);
