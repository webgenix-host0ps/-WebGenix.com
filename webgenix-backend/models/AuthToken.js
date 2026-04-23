import mongoose from 'mongoose';

const { Schema } = mongoose;

const authTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    type: {
        type: String,
        enum: ['email_verification', 'password_reset'],
        required: true,
    },

    token: {
        type: String,
        required: true,
    },

    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },

}, { timestamps: { createdAt: true, updatedAt: false } });


// ⏳ TTL index
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('AuthToken', authTokenSchema);