import { asyncHandler } from '../../utils/asyncHandler.js';
import * as leadService from './lead.service.js';

export const create = asyncHandler(async (req, res) => {
    const { email, password, name, phone, ...leadData } = req.body;
    const lead = await leadService.createLead(
        { email, password, name, phone },
        leadData,
        req
    );
    res.status(201).json({ success: true, message: 'Lead created successfully', data: lead });
});

export const list = asyncHandler(async (req, res) => {
    const result = await leadService.getLeads(req.query);
    res.json({ success: true, ...result });
});

export const getById = asyncHandler(async (req, res) => {
    const lead = await leadService.getLeadById(req.params.id);
    res.json({ success: true, data: lead });
});

export const update = asyncHandler(async (req, res) => {
    const lead = await leadService.updateLead(req.params.id, req.body, req);
    res.json({ success: true, message: 'Lead updated successfully', data: lead });
});

export const transition = asyncHandler(async (req, res) => {
    const { stage, note } = req.body;
    const lead = await leadService.transitionStage(req.params.id, stage, {
        note,
        userId: req.user._id,
    });
    res.json({ success: true, message: `Lead moved to ${stage}`, data: lead });
});

export const convert = asyncHandler(async (req, res) => {
    const lead = await leadService.convertToClient(req.params.id, req);
    res.json({ success: true, message: 'Lead converted to client successfully', data: lead });
});

export const remove = asyncHandler(async (req, res) => {
    await leadService.deleteLead(req.params.id);
    res.json({ success: true, message: 'Lead deleted successfully' });
});

export const pipelineStats = asyncHandler(async (req, res) => {
    const stats = await leadService.getPipelineStats();
    res.json({ success: true, data: stats });
});
