import PredefinedReply from './models/PredefinedReply.js';
import { ApiError } from '../../utils/ApiError.js';

export const listPredefinedReplies = async (departmentId) => {
    const query = { isActive: true };
    if (departmentId) {
        query.$or = [{ department: departmentId }, { department: null }];
    }
    return await PredefinedReply.find(query).sort({ title: 1 });
};

export const createPredefinedReply = async (data) => {
    return await PredefinedReply.create(data);
};

export const updatePredefinedReply = async (id, data) => {
    const reply = await PredefinedReply.findByIdAndUpdate(id, data, { new: true });
    if (!reply) throw new ApiError(404, 'Predefined reply not found');
    return reply;
};

export const deletePredefinedReply = async (id) => {
    const reply = await PredefinedReply.findByIdAndDelete(id);
    if (!reply) throw new ApiError(404, 'Predefined reply not found');
    return reply;
};
