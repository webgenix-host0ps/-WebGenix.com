import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['client', 'admin', 'support', 'billing', 'lead'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String,
                fileSize: Number,
            },
        ],
        isInternal: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('TicketMessage', ticketMessageSchema);
