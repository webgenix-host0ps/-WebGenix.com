import { asyncHandler } from '../../utils/asyncHandler.js';
import * as replyService from './predefinedReply.service.js';

export const getReplies = asyncHandler(async (req, res) => {
    const replies = await replyService.listPredefinedReplies(req.query.departmentId);
    res.status(200).json({ success: true, data: replies });
});

export const createReply = asyncHandler(async (req, res) => {
    const reply = await replyService.createPredefinedReply(req.body);
    res.status(201).json({ success: true, data: reply });
});

export const updateReply = asyncHandler(async (req, res) => {
    const reply = await replyService.updatePredefinedReply(req.params.id, req.body);
    res.status(200).json({ success: true, data: reply });
});

export const deleteReply = asyncHandler(async (req, res) => {
    await replyService.deletePredefinedReply(req.params.id);
    res.status(204).json({ success: true, data: null });
});
