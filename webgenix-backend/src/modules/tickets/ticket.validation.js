import { z } from 'zod';
import { TICKET_STATUS, TICKET_PRIORITY } from '../../constants/tickets.js';

// Helper for MongoDB ObjectId validation
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const createTicketSchema = z.object({
    body: z.object({
        subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(200),
        description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
        departmentId: objectId,
        priority: z.enum(Object.values(TICKET_PRIORITY)).optional(),
    }),
});

export const replyTicketSchema = z.object({
    body: z.object({
        message: z.string().trim().min(1, 'Message is required').max(5000),
        attachments: z.array(
            z.object({
                fileName: z.string().max(255),
                fileUrl: z.string().url('Invalid attachment URL'),
                fileType: z.string().max(100),
                fileSize: z.number().max(25 * 1024 * 1024, 'File too large (max 25MB)'),
            })
        ).max(5, 'Maximum 5 attachments allowed').optional(),
        isInternal: z.boolean().optional(),
    }),
});

export const changeStatusSchema = z.object({
    body: z.object({
        status: z.enum(Object.values(TICKET_STATUS)),
    }),
});

export const assignTicketSchema = z.object({
    body: z.object({
        assignedTo: objectId,
    }),
});

export const listTicketsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        status: z.string().max(50).optional(),
        priority: z.enum(Object.values(TICKET_PRIORITY)).optional(),
        department: objectId.optional(),
        search: z.string().max(100).optional(),
    }),
});
