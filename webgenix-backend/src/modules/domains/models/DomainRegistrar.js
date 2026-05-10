import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * DomainRegistrar — stores API credentials and config for domain registrars
 * (e.g. ResellerClub, LogicBoxes, GoDaddy).
 */
const domainRegistrarSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['resellerclub', 'logicboxes', 'enom', 'custom'],
        required: true,
    },
    apiUrl: {
        type: String,
        required: true,
    },
    apiKey: {
        type: String,
        required: true,
    },
    resellerId: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    testMode: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

export default mongoose.model('DomainRegistrar', domainRegistrarSchema);
