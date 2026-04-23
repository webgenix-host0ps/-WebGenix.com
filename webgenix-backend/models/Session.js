import mongoose from 'mongoose';

const { Schema } = mongoose;

const sessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    refreshToken: {
        type: String,
        required: true,
    },

    device: {
        userAgent: String,
        ip: String,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },

    lastUsedAt: Date,

}, { timestamps: { createdAt: true, updatedAt: false } });


// ⏳ TTL index (auto delete expired sessions)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);