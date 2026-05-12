import Lead from './models/Lead.js';
import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { LEAD_STAGES, LEAD_PIPELINE_ORDER } from '../../constants/leads.js';

export const createLead = async (userData, leadData, req) => {
    const { email, password, name, phone } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Email already registered');
    }

    const user = await User.create({
        email,
        password: password || Math.random().toString(36).slice(-12),
        name,
        phone,
        role: 'lead',
        emailVerified: false,
    });

    const lead = await Lead.create({
        user: user._id,
        source: leadData.source || 'website',
        sourceDetails: leadData.sourceDetails,
        assignedTo: leadData.assignedTo,
        potentialValue: leadData.potentialValue || 0,
        tags: leadData.tags || [],
        notes: leadData.notes,
        followUpDate: leadData.followUpDate,
        estimatedCloseDate: leadData.estimatedCloseDate,
        stageHistory: [{
            stage: LEAD_STAGES.NEW,
            enteredAt: new Date(),
            changedBy: req?.userId,
        }],
    });

    return Lead.findById(lead._id).populate('user', 'name email phone role isActive createdAt');
};

export const getLeads = async ({ page = 1, limit = 10, stage, source, assignedTo, search, tag }) => {
    const query = {};

    if (stage && stage !== 'all') query.pipelineStage = stage;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    if (tag) query.tags = tag;

    if (search) {
        const users = await User.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('_id');

        query.user = { $in: users.map(u => u._id) };
    }

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
        Lead.find(query)
            .populate('user', 'name email phone role isActive createdAt')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Lead.countDocuments(query),
    ]);

    return {
        leads,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getLeadById = async (id) => {
    const lead = await Lead.findById(id)
        .populate('user', 'name email phone role isActive createdAt')
        .populate('assignedTo', 'name email')
        .populate('convertedToClient', 'name email');
    if (!lead) throw new ApiError(404, 'Lead not found');
    return lead;
};

export const updateLead = async (id, updateData, req) => {
    const lead = await Lead.findById(id);
    if (!lead) throw new ApiError(404, 'Lead not found');

    const allowedFields = ['source', 'sourceDetails', 'assignedTo', 'potentialValue',
        'currency', 'tags', 'notes', 'followUpDate', 'estimatedCloseDate', 'lostReason'];
    const updates = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    if (updateData.name || updateData.email || updateData.phone) {
        const userUpdates = {};
        if (updateData.name) userUpdates.name = updateData.name;
        if (updateData.email) userUpdates.email = updateData.email;
        if (updateData.phone) userUpdates.phone = updateData.phone;
        await User.findByIdAndUpdate(lead.user, { $set: userUpdates });
    }

    const updated = await Lead.findByIdAndUpdate(id, { $set: updates }, { new: true })
        .populate('user', 'name email phone role isActive createdAt')
        .populate('assignedTo', 'name email');

    return updated;
};

export const transitionStage = async (id, newStage, { note, userId } = {}) => {
    const lead = await Lead.findById(id);
    if (!lead) throw new ApiError(404, 'Lead not found');

    if (!Object.values(LEAD_STAGES).includes(newStage)) {
        throw new ApiError(400, `Invalid stage: ${newStage}`);
    }

    const currentIndex = LEAD_PIPELINE_ORDER.indexOf(lead.pipelineStage);
    const newIndex = LEAD_PIPELINE_ORDER.indexOf(newStage);

    if (newIndex < currentIndex && newStage !== LEAD_STAGES.LOST) {
        throw new ApiError(400, 'Cannot move lead backwards in pipeline except to lost');
    }

    lead.pipelineStage = newStage;
    lead.stageHistory.push({
        stage: newStage,
        enteredAt: new Date(),
        changedBy: userId,
        note,
    });

    if (newStage === LEAD_STAGES.WON) {
        lead.convertedAt = new Date();
        lead.convertedValue = lead.convertedValue || lead.potentialValue;
    }

    await lead.save();

    return Lead.findById(lead._id)
        .populate('user', 'name email phone role isActive createdAt')
        .populate('assignedTo', 'name email');
};

export const convertToClient = async (id, req) => {
    const lead = await Lead.findById(id).populate('user');
    if (!lead) throw new ApiError(404, 'Lead not found');
    if (lead.convertedToClient) throw new ApiError(400, 'Lead already converted');

    const user = await User.findById(lead.user._id);
    if (!user) throw new ApiError(404, 'Lead user not found');

    user.role = 'client';
    user.emailVerified = true;
    await user.save();

    lead.pipelineStage = LEAD_STAGES.WON;
    lead.convertedToClient = user._id;
    lead.convertedAt = new Date();
    lead.convertedValue = lead.convertedValue || lead.potentialValue;
    lead.stageHistory.push({
        stage: LEAD_STAGES.WON,
        enteredAt: new Date(),
        changedBy: req?.userId,
        note: 'Converted to client',
    });

    await lead.save();

    return Lead.findById(lead._id)
        .populate('user', 'name email phone role isActive createdAt')
        .populate('convertedToClient', 'name email');
};

export const deleteLead = async (id) => {
    const lead = await Lead.findById(id);
    if (!lead) throw new ApiError(404, 'Lead not found');

    await User.findByIdAndDelete(lead.user);
    await Lead.findByIdAndDelete(id);

    return true;
};

export const getPipelineStats = async () => {
    const stages = await Lead.aggregate([
        {
            $group: {
                _id: '$pipelineStage',
                count: { $sum: 1 },
                totalValue: { $sum: '$potentialValue' },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const totalLeads = stages.reduce((sum, s) => sum + s.count, 0);
    const totalValue = stages.reduce((sum, s) => sum + s.totalValue, 0);

    const stageOrder = LEAD_PIPELINE_ORDER;
    const stats = stageOrder.map(stage => {
        const found = stages.find(s => s._id === stage);
        return {
            stage,
            count: found?.count || 0,
            totalValue: found?.totalValue || 0,
        };
    });

    return { stats, totalLeads, totalValue };
};
