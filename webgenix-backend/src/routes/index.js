import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import ticketRoutes from '../modules/tickets/ticket.routes.js';
import billingRoutes from '../modules/billing/billing.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import serverRoutes from '../modules/servers/server.routes.js';
import domainRoutes from '../modules/domains/domain.routes.js';
import taxRoutes from '../modules/tax/tax.routes.js';
import kbRoutes from '../modules/knowledgebase/kb.routes.js';
import leadRoutes from '../modules/leads/lead.routes.js';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/billing', billingRoutes);
router.use('/admin', adminRoutes);
router.use('/servers', serverRoutes);
router.use('/domains', domainRoutes);
router.use('/tax', taxRoutes);
router.use('/kb', kbRoutes);
router.use('/leads', leadRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;