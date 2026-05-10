import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Domain model — tracks client domain registrations, lifecycle, and registrar info.
 * Integrates with DomainRegistrar for API-level operations.
 */
const domainSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Domain name is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    tld: {
        type: String,
        required: true, // e.g. 'com', 'in', 'org'
    },
    registrarId: {
        type: Schema.Types.ObjectId,
        ref: 'DomainRegistrar',
    },
    registrarDomainId: String, // ID from the registrar's API

    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'suspended', 'transferring', 'cancelled', 'redemption'],
        default: 'pending',
        index: true,
    },

    registeredAt: Date,
    expiryDate: {
        type: Date,
        index: true,
    },
    autoRenew: {
        type: Boolean,
        default: false,
    },

    // Transfer
    eppCode: String,
    transferStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected', 'completed'],
        default: 'none',
    },

    // DNS
    nameServers: [{
        type: String,
        trim: true,
    }],

    // WHOIS privacy
    whoisPrivacy: {
        type: Boolean,
        default: false,
    },

    // Lock
    isLocked: {
        type: Boolean,
        default: true,
    },

    // Linked billing
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
    },
    invoiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
    },

    notes: String,
}, {
    timestamps: true,
});

// Compound indexes for common queries
domainSchema.index({ userId: 1, status: 1 });
domainSchema.index({ expiryDate: 1, autoRenew: 1 });

export default mongoose.model('Domain', domainSchema);
