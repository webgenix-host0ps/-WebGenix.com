import { z } from 'zod';

const productPricingSchema = z.object({
    cycle: z.string(),
    price: z.number().min(0),
    setupFee: z.number().min(0).default(0),
    cancellationFee: z.number().min(0).default(0),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

const productFeatureSchema = z.object({
    name: z.string().min(1),
    value: z.string(),
    included: z.boolean().default(true),
    quantity: z.number().optional(),
});

const productOptionSchema = z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    priceModifiers: z.array(z.object({
        option: z.string(),
        modifierType: z.string(),
        modifier: z.number(),
    })).optional(),
});

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(200),
        slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
        type: z.enum(['hosting', 'domain', 'ssl', 'addon', 'service']),
        description: z.string().optional(),
        category: z.string().optional(),
        icon: z.string().optional(),
        module: z.string().optional(),
        pricing: z.array(productPricingSchema).min(1, 'At least one pricing is required'),
        features: z.array(productFeatureSchema).optional(),
        options: z.array(productOptionSchema).optional(),
        order: z.number().int().default(0),
        featured: z.boolean().default(false),
        status: z.enum(['active', 'inactive', 'archived']).default('active'),
        requiresParent: z.boolean().default(false),
        taxEnabled: z.boolean().default(true),
        showOnHomepage: z.boolean().default(false),
        homepageGroup: z.enum(['solutions', 'infrastructure', 'addons', '']).default(''),
        homepageOrder: z.number().int().default(0),
        tagline: z.string().optional(),
        target: z.string().optional(),
        ctaLabel: z.string().optional(),
        ctaLink: z.string().optional(),
        badge: z.string().optional(),
        isRecommended: z.boolean().default(false),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        icon: z.string().optional(),
        module: z.string().optional(),
        pricing: z.array(productPricingSchema).optional(),
        features: z.array(productFeatureSchema).optional(),
        options: z.array(productOptionSchema).optional(),
        order: z.number().int().optional(),
        featured: z.boolean().optional(),
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        requiresParent: z.boolean().optional(),
        taxEnabled: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
        homepageGroup: z.enum(['solutions', 'infrastructure', 'addons', '']).optional(),
        homepageOrder: z.number().int().optional(),
        tagline: z.string().optional(),
        target: z.string().optional(),
        ctaLabel: z.string().optional(),
        ctaLink: z.string().optional(),
        badge: z.string().optional(),
        isRecommended: z.boolean().optional(),
    }),
});

export const productQuerySchema = z.object({
    query: z.object({
        type: z.enum(['hosting', 'domain', 'ssl', 'addon', 'service']).optional(),
        category: z.string().optional(),
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        featured: z.boolean().optional(),
        search: z.string().max(100).optional(),
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }),
});

export const getProductSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    }),
});