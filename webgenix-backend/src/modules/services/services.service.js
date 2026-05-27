import Service from './models/Service.js';
import { ApiError } from '../../utils/ApiError.js';

export const createService = async (data) => {
    const existing = await Service.findOne({ slug: data.slug });
    if (existing) throw new ApiError(409, 'Service with this slug already exists');
    return Service.create(data);
};

export const updateService = async (id, data) => {
    const svc = await Service.findById(id);
    if (!svc) throw new ApiError(404, 'Service not found');
    Object.assign(svc, data);
    return svc.save();
};

export const deleteService = async (id) => {
    const svc = await Service.findById(id);
    if (!svc) throw new ApiError(404, 'Service not found');
    await svc.deleteOne();
    return true;
};

export const getServiceById = async (id) => {
    const svc = await Service.findById(id);
    if (!svc) throw new ApiError(404, 'Service not found');
    return svc;
};

export const getServiceBySlug = async (slug) => {
    const svc = await Service.findOne({ slug, status: { $ne: 'hidden' } });
    if (!svc) throw new ApiError(404, 'Service not found');
    return svc;
};

export const listServices = async (filters = {}) => {
    const query = {};
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    else query.status = { $ne: 'hidden' };

    return Service.find(query).sort({ order: 1, name: 1 });
};

export const getServicesByType = async (type) => {
    return Service.find({ type, status: { $ne: 'hidden' } }).sort({ order: 1 });
};
