import { z } from 'zod';

export const createServiceSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, 'Name is required'),
        slug: z.string().toLowerCase().min(1, 'Slug is required'),
        type: z.enum(['web-development', 'web-security', 'package']),
        category: z.string().optional().or(z.literal('')),
        description: z.string().optional().or(z.literal('')),
        fullDescription: z.string().optional().or(z.literal('')),
        icon: z.string().optional().or(z.literal('')),
        image: z.string().optional().or(z.literal('')),
        price: z.number().min(0).optional(),
        pricingLabel: z.string().optional().or(z.literal('')),
        features: z.array(
            z.object({
                name: z.string().optional(),
                value: z.string().optional(),
                included: z.boolean().optional(),
            })
        ).optional(),
        deliverables: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        status: z.enum(['active', 'hidden', 'coming-soon']).optional(),
        order: z.number().optional(),
        recommended: z.boolean().optional(),
        badge: z.string().optional().or(z.literal('')),
    }),
});

export const updateServiceSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).optional(),
        slug: z.string().toLowerCase().min(1).optional(),
        type: z.enum(['web-development', 'web-security', 'package']).optional(),
        category: z.string().optional().or(z.literal('')),
        description: z.string().optional().or(z.literal('')),
        fullDescription: z.string().optional().or(z.literal('')),
        icon: z.string().optional().or(z.literal('')),
        image: z.string().optional().or(z.literal('')),
        price: z.number().min(0).optional(),
        pricingLabel: z.string().optional().or(z.literal('')),
        features: z.array(
            z.object({
                name: z.string().optional(),
                value: z.string().optional(),
                included: z.boolean().optional(),
            })
        ).optional(),
        deliverables: z.array(z.string()).optional(),
        techStack: z.array(z.string()).optional(),
        status: z.enum(['active', 'hidden', 'coming-soon']).optional(),
        order: z.number().optional(),
        recommended: z.boolean().optional(),
        badge: z.string().optional().or(z.literal('')),
    }),
});
