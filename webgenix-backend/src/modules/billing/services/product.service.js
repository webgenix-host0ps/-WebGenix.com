import Product from '../models/Product.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logAction } from '../../../services/audit.service.js';

export const createProduct = async (productData, req) => {
    // Check if slug already exists
    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
        throw new ApiError(409, 'Product with this slug already exists');
    }

    // Ensure at least one default pricing
    const hasDefault = productData.pricing?.some(p => p.isDefault);
    if (!hasDefault && productData.pricing?.length > 0) {
        productData.pricing[0].isDefault = true;
    }

    const product = await Product.create(productData);

    await logAction({
        userId: req.userId,
        action: 'product.created',
        metadata: { productId: product._id, name: product.name },
        req,
    });

    return product;
};

export const updateProduct = async (productId, updateData, req) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    // Don't allow changing type or slug
    delete updateData.type;
    delete updateData.slug;

    // Ensure pricing integrity
    if (updateData.pricing) {
        const hasDefault = updateData.pricing.some(p => p.isDefault);
        if (!hasDefault && updateData.pricing.length > 0) {
            updateData.pricing[0].isDefault = true;
        }
    }

    Object.assign(product, updateData);
    await product.save();

    await logAction({
        userId: req.userId,
        action: 'product.updated',
        metadata: { productId: product._id, name: product.name },
        req,
    });

    return product;
};

export const deleteProduct = async (productId, req) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    // Check if product has active services
    const Service = (await import('../models/Service.js')).default;
    const activeServices = await Service.countDocuments({ 
        productId, 
        status: { $in: ['active', 'pending', 'suspended'] } 
    });
    
    if (activeServices > 0) {
        // Archive instead of delete
        product.status = 'archived';
        await product.save();
    } else {
        await product.deleteOne();
    }

    await logAction({
        userId: req.userId,
        action: 'product.deleted',
        metadata: { productId, name: product.name },
        req,
    });

    return true;
};

export const getProductById = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    return product;
};

export const getProductBySlug = async (slug) => {
    const product = await Product.findOne({ slug, status: 'active' });
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    return product;
};

export const listProducts = async (filters, pagination) => {
    const { type, category, status, featured, search } = filters;
    let { page = 1, limit = 20 } = pagination;
    
    limit = Math.min(parseInt(limit), 100);
    page = Math.max(parseInt(page), 1);

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured;
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Default to active products for public listings
    if (!status && !query.$and) {
        query.status = 'active';
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find(query)
            .sort({ order: 1, name: 1 })
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query),
    ]);

    return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

export const getProductsByType = async (type, status = 'active') => {
    return Product.find({ type, status }).sort({ order: 1, name: 1 });
};

export const getFeaturedProducts = async () => {
    return Product.find({ featured: true, status: 'active' }).sort({ order: 1 });
};

export const getHomepageProducts = async () => {
    const products = await Product.find({
        showOnHomepage: true,
        status: 'active',
    }).sort({ homepageOrder: 1, order: 1 });

    const groups = { solutions: [], infrastructure: [], addons: [] };
    for (const p of products) {
        if (groups[p.homepageGroup]) {
            groups[p.homepageGroup].push(p);
        }
    }
    return groups;
};

export const getAddons = async () => {
    return Product.find({ type: 'addon', status: 'active' }).sort({ order: 1 });
};

export const getAddonsForProduct = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    
    // Get addons that can be attached to this product type
    return Product.find({ 
        type: 'addon', 
        status: 'active',
        $or: [
            { parentProduct: productId },
            { parentProduct: { $exists: false } }
        ]
    }).sort({ order: 1 });
};

export const getProductPricing = async (productId, cycle) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }
    
    if (cycle) {
        return product.pricing.find(p => p.cycle === cycle && p.isActive);
    }
    
    return product.pricing.filter(p => p.isActive);
};

export const getProductWithPricing = async (productId, cycle) => {
    const product = await getProductById(productId);
    let selectedPricing = product.pricing.find(p => p.isDefault);
    
    if (cycle) {
        const cyclePricing = product.pricing.find(p => p.cycle === cycle && p.isActive);
        if (cyclePricing) selectedPricing = cyclePricing;
    }
    
    return {
        ...product.toObject(),
        selectedPricing,
    };
};

export const toggleProductStatus = async (productId, req) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, 'Product not found');
    }

    product.status = product.status === 'active' ? 'inactive' : 'active';
    await product.save();

    await logAction({
        userId: req.userId,
        action: `product.${product.status}`,
        metadata: { productId: product._id, name: product.name },
        req,
    });

    return product;
};

export const duplicateProduct = async (productId, req) => {
    const original = await Product.findById(productId);
    if (!original) {
        throw new ApiError(404, 'Product not found');
    }

    const newProductData = original.toObject();
    delete newProductData._id;
    delete newProductData.createdAt;
    delete newProductData.updatedAt;
    newProductData.name = `${newProductData.name} (Copy)`;
    newProductData.slug = `${newProductData.slug}-copy-${Date.now()}`;
    newProductData.status = 'inactive';
    newProductData.order = 0;

    const duplicate = await Product.create(newProductData);

    await logAction({
        userId: req.userId,
        action: 'product.duplicated',
        metadata: { originalId: productId, newId: duplicate._id },
        req,
    });

    return duplicate;
};

export const getProductCategories = async (type = null) => {
    const query = type ? { type, status: 'active' } : { status: 'active' };
    const products = await Product.find(query).select('category').distinct('category');
    return products.filter(c => c);
};

export const importProducts = async (productsData, req) => {
    const results = {
        created: [],
        updated: [],
        failed: [],
    };

    for (const productData of productsData) {
        try {
            const existing = await Product.findOne({ slug: productData.slug });
            
            if (existing) {
                Object.assign(existing, productData);
                await existing.save();
                results.updated.push(existing._id);
            } else {
                const product = await Product.create(productData);
                results.created.push(product._id);
            }
        } catch (error) {
            results.failed.push({ slug: productData.slug, error: error.message });
        }
    }

    await logAction({
        userId: req.userId,
        action: 'products.imported',
        metadata: { 
            created: results.created.length, 
            updated: results.updated.length,
            failed: results.failed.length 
        },
        req,
    });

    return results;
};