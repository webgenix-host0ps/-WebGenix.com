import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Server model — stores connection details for hosting servers (cPanel/WHM).
 * Used by the provisioning service for account CRUD.
 */
const serverSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Server name is required'],
        trim: true,
    },
    hostname: {
        type: String,
        required: [true, 'Hostname is required'],
        trim: true,
    },
    ipAddress: {
        type: String,
        required: [true, 'IP address is required'],
        trim: true,
    },
    port: {
        type: Number,
        default: 2087, // WHM default port
    },

    // Auth
    apiUsername: {
        type: String,
        required: true,
    },
    apiToken: {
        type: String,
        required: true,
        select: false, // sensitive — never return in queries
    },

    type: {
        type: String,
        enum: ['cpanel', 'vps', 'dedicated', 'custom'],
        default: 'cpanel',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'error'],
        default: 'active',
        index: true,
    },

    // Capacity
    maxAccounts: {
        type: Number,
        default: 500,
    },
    activeAccounts: {
        type: Number,
        default: 0,
    },

    // Group
    serverGroupId: {
        type: Schema.Types.ObjectId,
        ref: 'ServerGroup',
    },

    // Monitoring
    lastCheckedAt: Date,
    lastCheckStatus: {
        type: String,
        enum: ['ok', 'warning', 'error', 'unknown'],
        default: 'unknown',
    },

    notes: String,
    metadata: Schema.Types.Mixed,
}, {
    timestamps: true,
});

serverSchema.index({ status: 1, serverGroupId: 1 });

export default mongoose.model('Server', serverSchema);
