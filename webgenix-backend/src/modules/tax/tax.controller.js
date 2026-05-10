import TaxRule from './models/TaxRule.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Get all tax rules
export const getTaxRules = asyncHandler(async (req, res) => {
    const taxRules = await TaxRule.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, taxRules, 'Tax rules retrieved successfully'));
});

// Create tax rule
export const createTaxRule = asyncHandler(async (req, res) => {
    const { name, rate, jurisdiction, type, hsnCode, isDefault, isActive } = req.body;

    // If isDefault is true, unset other defaults in the same jurisdiction
    if (isDefault) {
        await TaxRule.updateMany({ jurisdiction }, { isDefault: false });
    }

    const taxRule = await TaxRule.create({
        name,
        rate,
        jurisdiction,
        type,
        hsnCode,
        isDefault,
        isActive
    });

    res.status(201).json(new ApiResponse(201, taxRule, 'Tax rule created successfully'));
});

// Update tax rule
export const updateTaxRule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (updates.isDefault) {
        const currentRule = await TaxRule.findById(id);
        await TaxRule.updateMany({ jurisdiction: currentRule.jurisdiction }, { isDefault: false });
    }

    const taxRule = await TaxRule.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!taxRule) throw new ApiError(404, 'Tax rule not found');

    res.status(200).json(new ApiResponse(200, taxRule, 'Tax rule updated successfully'));
});

// Delete tax rule
export const deleteTaxRule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const taxRule = await TaxRule.findByIdAndDelete(id);
    if (!taxRule) throw new ApiError(404, 'Tax rule not found');

    res.status(200).json(new ApiResponse(200, null, 'Tax rule deleted successfully'));
});
