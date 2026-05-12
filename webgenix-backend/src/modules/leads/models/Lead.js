import mongoose from 'mongoose';
import { LEAD_STAGES, LEAD_SOURCES } from '../../../constants/leads.js';

const stageHistorySchema = new mongoose.Schema({
    stage: {
        type: String,
        enum: Object.values(LEAD_STAGES),
        required: true,
    },
    enteredAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
}, { _id: false });

const leadSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    pipelineStage: {
        type: String,
        enum: Object.values(LEAD_STAGES),
        default: LEAD_STAGES.NEW,
        index: true,
    },
    source: {
        type: String,
        enum: Object.values(LEAD_SOURCES),
        default: LEAD_SOURCES.WEBSITE,
    },
    sourceDetails: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    potentialValue: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    tags: [String],
    notes: String,
    followUpDate: Date,
    stageHistory: [stageHistorySchema],
    convertedToClient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    convertedAt: Date,
    convertedValue: Number,
    lostReason: String,
    estimatedCloseDate: Date,
}, { timestamps: true });

leadSchema.index({ pipelineStage: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, pipelineStage: 1 });
leadSchema.index({ followUpDate: 1 }, { sparse: true });
leadSchema.index({ tags: 1 });

export default mongoose.model('Lead', leadSchema);
