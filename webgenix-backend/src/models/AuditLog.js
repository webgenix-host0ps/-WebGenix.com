import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    action: {
        type: String,
        required: true,
        index: true,
    },
    targetUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    resource: {
        type: String, // 'invoice', 'ticket', 'service', 'user', etc.
    },
    resourceId: {
        type: Schema.Types.ObjectId,
    },
    changes: {
        type: Schema.Types.Mixed, // e.g., { before: {}, after: {} }
    },
    metadata: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export default mongoose.model('AuditLog', auditLogSchema);