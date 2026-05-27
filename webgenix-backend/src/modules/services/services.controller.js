import { asyncHandler } from '../../utils/asyncHandler.js';
import * as svcService from './services.service.js';

export const create = asyncHandler(async (req, res) => {
    const service = await svcService.createService(req.body);
    res.status(201).json({ success: true, data: service });
});

export const update = asyncHandler(async (req, res) => {
    const service = await svcService.updateService(req.params.id, req.body);
    res.json({ success: true, data: service });
});

export const remove = asyncHandler(async (req, res) => {
    await svcService.deleteService(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
});

export const getById = asyncHandler(async (req, res) => {
    const service = await svcService.getServiceById(req.params.id);
    res.json({ success: true, data: service });
});

export const getBySlug = asyncHandler(async (req, res) => {
    const service = await svcService.getServiceBySlug(req.params.slug);
    res.json({ success: true, data: service });
});

export const list = asyncHandler(async (req, res) => {
    const services = await svcService.listServices(req.query);
    res.json({ success: true, data: services });
});
