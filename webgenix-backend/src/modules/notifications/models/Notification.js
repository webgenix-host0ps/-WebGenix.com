import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Notification model — for in-app alerts sent to users.
 */
const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true, // e.g. 'invoice_generated', 'ticket_replied'
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    actionLink: {
        type: String, // Optional URL to redirect the user when clicked
    },
    referenceId: {
        type: Schema.Types.ObjectId, // ID of the related resource (e.g. ticket ID)
    },
    referenceModel: {
        type: String, // 'Ticket', 'Invoice', 'Order', etc.
    },
}, {
    timestamps: true,
});

export default mongoose.model('Notification', notificationSchema);
