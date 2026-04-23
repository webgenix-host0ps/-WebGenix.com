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
    },
    metadata: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

auditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);