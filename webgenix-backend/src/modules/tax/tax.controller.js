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

// Calculate GST for a given amount and state
export const calculateTax = asyncHandler(async (req, res) => {
    const { amount, state, isInterstate } = req.query;
    const parsedAmount = parseFloat(amount);
    
    if (!amount || isNaN(parsedAmount) || parsedAmount < 0) {
        throw new ApiError(400, 'Valid amount is required');
    }

    // Find default tax rule for the jurisdiction
    const jurisdiction = isInterstate === 'true' ? 'INTERSTATE' : (state || 'DEFAULT');
    const taxRule = await TaxRule.findOne({ jurisdiction, isActive: true, isDefault: true });
    
    const gstRate = taxRule?.rate || 18; // Default 18% GST
    const hsnCode = taxRule?.hsnCode || '';

    let cgst = 0, sgst = 0, igst = 0;
    
    if (isInterstate === 'true') {
        igst = parsedAmount * gstRate / 100;
    } else {
        cgst = parsedAmount * (gstRate / 2) / 100;
        sgst = parsedAmount * (gstRate / 2) / 100;
    }

    const totalTax = cgst + sgst + igst;

    res.status(200).json(new ApiResponse(200, {
        subtotal: parsedAmount,
        taxRate: gstRate,
        taxName: taxRule?.name || 'GST',
        hsnCode,
        isInterstate: isInterstate === 'true',
        breakdown: [
            ...(cgst > 0 ? [{ name: 'CGST', rate: gstRate / 2, amount: cgst }] : []),
            ...(sgst > 0 ? [{ name: 'SGST', rate: gstRate / 2, amount: sgst }] : []),
            ...(igst > 0 ? [{ name: 'IGST', rate: gstRate, amount: igst }] : []),
        ],
        totalTax,
        total: parsedAmount + totalTax
    }, 'Tax calculated successfully'));
});
