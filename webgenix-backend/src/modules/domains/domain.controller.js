import Domain from './models/Domain.js';
import TldPricing from './models/TldPricing.js';
import DomainRegistrar from './models/DomainRegistrar.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// --- Domain Controllers ---

export const getDomains = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const [domains, total] = await Promise.all([
        Domain.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        Domain.countDocuments(query)
    ]);

    res.status(200).json(new ApiResponse(200, { domains, total, pages: Math.ceil(total / limit) }, 'Domains retrieved successfully'));
});

// --- TLD Pricing Controllers ---

export const getTldPricing = asyncHandler(async (req, res) => {
    const pricing = await TldPricing.find().sort({ tld: 1 });
    res.status(200).json(new ApiResponse(200, pricing, 'TLD pricing retrieved successfully'));
});

export const updateTldPricing = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pricing = await TldPricing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json(new ApiResponse(200, pricing, 'TLD pricing updated successfully'));
});

export const createTldPricing = asyncHandler(async (req, res) => {
    const pricing = await TldPricing.create(req.body);
    res.status(201).json(new ApiResponse(201, pricing, 'TLD pricing created successfully'));
});

// --- Registrar Controllers ---

export const getRegistrars = asyncHandler(async (req, res) => {
    const registrars = await DomainRegistrar.find().sort({ name: 1 });
    res.status(200).json(new ApiResponse(200, registrars, 'Registrars retrieved successfully'));
});

export const createRegistrar = asyncHandler(async (req, res) => {
    const registrar = await DomainRegistrar.create(req.body);
    res.status(201).json(new ApiResponse(201, registrar, 'Registrar created successfully'));
});
