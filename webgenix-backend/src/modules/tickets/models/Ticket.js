import mongoose from 'mongoose';
import { TICKET_STATUS, TICKET_PRIORITY } from '../../../constants/tickets.js';
import Counter from '../../../models/Counter.js';

const ticketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            unique: true,
            index: true,
        },
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: Object.values(TICKET_STATUS),
            default: TICKET_STATUS.OPEN,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(TICKET_PRIORITY),
            default: TICKET_PRIORITY.MEDIUM,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },
        lastReplyBy: {
            type: String,
            enum: ['CLIENT', 'STAFF'],
            default: 'CLIENT',
        },
        lastReplyAt: {
            type: Date,
        },
        tags: [
            {
                type: String,
            },
        ],
        linkedServiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
        linkedDomainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Domain',
        },
        isClosed: {
            type: Boolean,
            default: false,
            index: true,
        },
        closedAt: {
            type: Date,
        },
        watchers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        rating: {
            score: { type: Number, min: 1, max: 5 },
            comment: { type: String },
            createdAt: { type: Date }
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for list performance
ticketSchema.index({ status: 1, updatedAt: -1 });
ticketSchema.index({ client: 1, status: 1, createdAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1, updatedAt: -1 });
ticketSchema.index({ priority: 1, status: 1 });

// Pre-save hook to auto-generate ticketId in format TCK-YYYY-XXXX atomically
ticketSchema.pre('save', async function (next) {
    if (this.isNew) {
        const year = new Date().getFullYear();
        const counterId = `ticketId_${year}`;
        
        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const paddedSequence = counter.seq.toString().padStart(4, '0');
        this.ticketId = `TCK-${year}-${paddedSequence}`;
    }
    next();
});

export default mongoose.model('Ticket', ticketSchema);
