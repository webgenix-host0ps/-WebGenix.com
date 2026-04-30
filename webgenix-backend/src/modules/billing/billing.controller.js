import { asyncHandler } from '../../utils/asyncHandler.js';
import * as productService from './services/product.service.js';
import * as billingService from './services/billing.service.js';
import PromoCode from './models/PromoCode.js';
import Service from './models/Service.js';
import { ApiError } from '../../utils/ApiError.js';

// ============ PRODUCT CONTROLLERS ============

export const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body, req);
    res.status(201).json({
        success: true,
        data: product,
    });
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body, req);
    res.json({
        success: true,
        data: product,
    });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await productService.deleteProduct(id, req);
    res.json({
        success: true,
        message: 'Product deleted successfully',
    });
});

export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.json({
        success: true,
        data: product,
    });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    res.json({
        success: true,
        data: product,
    });
});

export const listProducts = asyncHandler(async (req, res) => {
    const filters = {
        type: req.query.type,
        category: req.query.category,
        status: req.query.status,
        featured: req.query.featured,
        search: req.query.search,
    };
    const pagination = {
        page: req.query.page,
        limit: req.query.limit,
    };
    
    const result = await productService.listProducts(filters, pagination);
    res.json({
        success: true,
        data: result.products,
        meta: {
            total: result.total,
            page: result.page,
            pages: result.pages,
        },
    });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await productService.getFeaturedProducts();
    res.json({
        success: true,
        data: products,
    });
});

export const getProductCategories = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const categories = await productService.getProductCategories(type);
    res.json({
        success: true,
        data: categories,
    });
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.toggleProductStatus(id, req);
    res.json({
        success: true,
        data: product,
    });
});

export const duplicateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.duplicateProduct(id, req);
    res.status(201).json({
        success: true,
        data: product,
    });
});

// ============ ORDER CONTROLLERS ============

export const createOrder = asyncHandler(async (req, res) => {
    const orderData = {
        ...req.body,
        userId: req.userId,
        clientIp: req.ip,
        userAgent: req.headers['user-agent'],
    };
    
    const { order, invoice } = await billingService.createOrder(orderData, req);
    res.status(201).json({
        success: true,
        data: { order, invoice },
    });
});

export const getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await billingService.getOrderById(id, req.userId);
    res.json({
        success: true,
        data: order,
    });
});

export const listOrders = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
    };
    const pagination = {
        page: req.query.page,
        limit: req.query.limit,
    };
    
    const result = await billingService.listOrders(req.userId, filters, pagination);
    res.json({
        success: true,
        data: result.orders,
        meta: {
            total: result.total,
            page: result.page,
            pages: result.pages,
        },
    });
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await billingService.cancelOrder(id, req.userId, reason, req);
    res.json({
        success: true,
        data: order,
    });
});

// ============ INVOICE CONTROLLERS ============

export const getInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invoice = await billingService.getInvoiceById(id, req.userId);
    res.json({
        success: true,
        data: invoice,
    });
});

export const listInvoices = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        type: req.query.type,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
    };
    const pagination = {
        page: req.query.page,
        limit: req.query.limit,
    };
    
    const result = await billingService.listInvoices(req.userId, filters, pagination);
    res.json({
        success: true,
        data: result.invoices,
        meta: {
            total: result.total,
            page: result.page,
            pages: result.pages,
        },
    });
});

export const listAllInvoices = asyncHandler(async (req, res) => {
    const filters = {
        userId: req.query.userId,
        status: req.query.status,
        type: req.query.type,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
    };
    const pagination = {
        page: req.query.page,
        limit: req.query.limit,
    };
    
    const result = await billingService.listAllInvoices(filters, pagination);
    res.json({
        success: true,
        data: result.invoices,
        meta: {
            total: result.total,
            page: result.page,
            pages: result.pages,
        },
    });
});

export const calculateProration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newCycle } = req.body;
    const proration = await billingService.calculateProration(id, newCycle);
    res.json({
        success: true,
        data: proration,
    });
});

// ============ PROMOCODE CONTROLLERS ============

export const validatePromoCode = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const promo = await PromoCode.findOne({ code: code.toUpperCase() });
    
    if (!promo || !promo.isActive) {
        throw new ApiError(400, 'Invalid or expired promo code');
    }
    
    const validation = promo.isValid();
    
    res.json({
        success: true,
        data: {
            code: promo.code,
            type: promo.type,
            value: promo.value,
            description: promo.description,
            valid: validation.valid,
            reason: validation.reason,
        },
    });
});

export const getUserServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ user: req.user.id })
        .populate('product', 'name slug type')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: services,
    });
});

// ============ ADMIN CONTROLLERS ============

export const createPromoCode = asyncHandler(async (req, res) => {
    const promo = await PromoCode.create(req.body);
    res.status(201).json({
        success: true,
        data: promo,
    });
});

export const listPromoCodes = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const promos = await PromoCode.find(query).sort({ createdAt: -1 });
    res.json({
        success: true,
        data: promos,
    });
});

export const updatePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const promo = await PromoCode.findByIdAndUpdate(id, req.body, { new: true });
    if (!promo) {
        throw new ApiError(404, 'Promo code not found');
    }
    res.json({
        success: true,
        data: promo,
    });
});

export const deletePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const promo = await PromoCode.findByIdAndDelete(id);
    if (!promo) {
        throw new ApiError(404, 'Promo code not found');
    }
    res.json({
        success: true,
        message: 'Promo code deleted',
    });
});