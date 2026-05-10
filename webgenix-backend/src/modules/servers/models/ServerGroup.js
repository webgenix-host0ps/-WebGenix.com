import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * ServerGroup — groups multiple servers for load-balanced provisioning.
 */
const serverGroupSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true,
    },
    servers: [{
        type: Schema.Types.ObjectId,
        ref: 'Server',
    }],
    fillType: {
        type: String,
        enum: ['sequential', 'random', 'least-used'],
        default: 'sequential',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});

export default mongoose.model('ServerGroup', serverGroupSchema);
