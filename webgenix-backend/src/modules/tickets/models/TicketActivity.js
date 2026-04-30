import mongoose from 'mongoose';

const ticketActivitySchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: ['CREATED', 'REPLIED', 'STATUS_CHANGED', 'ASSIGNED', 'CLOSED', 'REOPENED', 'UPDATED'],
            required: true,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        oldValue: {
            type: mongoose.Schema.Types.Mixed,
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed,
        },
        note: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for activity history performance
ticketActivitySchema.index({ ticket: 1, createdAt: -1 });

export default mongoose.model('TicketActivity', ticketActivitySchema);
