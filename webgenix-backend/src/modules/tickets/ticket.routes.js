import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as ticketController from './ticket.controller.js';
import * as ticketValidation from './ticket.validation.js';
import * as replyController from './predefinedReply.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new ticket (only CLIENT for now, though logic allows restrict later, controller handles it)
router.post('/', validate(ticketValidation.createTicketSchema), ticketController.createTicket);

// List tickets
router.get('/', validate(ticketValidation.listTicketsSchema), ticketController.listTickets);

// Get a specific ticket with messages
router.get('/:id', ticketController.getTicket);

// Add a message (reply) to a ticket
router.post('/:id/messages', validate(ticketValidation.replyTicketSchema), ticketController.addMessage);

// Change ticket status (Support/Admin)
router.patch('/:id/status', validate(ticketValidation.changeStatusSchema), ticketController.changeStatus);

// Assign ticket (Support/Admin)
router.patch('/:id/assign', validate(ticketValidation.assignTicketSchema), ticketController.assignTicket);

// Close ticket
router.post('/:id/close', ticketController.closeTicket);

// Watchers
router.post('/:id/watch', ticketController.toggleWatcher);

// Ratings
router.post('/:id/rate', ticketController.submitRating);

// Predefined Replies
router.get('/settings/predefined-replies', replyController.getReplies);
router.post('/settings/predefined-replies', roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT, ROLES.LEAD]), replyController.createReply);
router.patch('/settings/predefined-replies/:id', roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT, ROLES.LEAD]), replyController.updateReply);
router.delete('/settings/predefined-replies/:id', roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT, ROLES.LEAD]), replyController.deleteReply);

export default router;
