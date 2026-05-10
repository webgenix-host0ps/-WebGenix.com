import cron from 'node-cron';
import Ticket from '../modules/tickets/models/Ticket.js';
import TicketActivity from '../modules/tickets/models/TicketActivity.js';
import { processRenewalInvoices, suspendOverdueServices } from '../modules/billing/services/billing.service.js';

/**
 * Automatically close tickets that have been in RESOLVED or ANSWERED status 
 * without any activity for X days.
 */
export const autoCloseTickets = async () => {
    try {
        const inactiveDays = 7; // WHMCS default is usually around 7 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

        // Find tickets that are RESOLVED or ANSWERED and haven't been updated since cutoff
        const ticketsToClose = await Ticket.find({
            status: { $in: ['RESOLVED', 'ANSWERED'] },
            updatedAt: { $lt: cutoffDate },
            isClosed: false
        });

        if (ticketsToClose.length === 0) return;

        console.log(`Cron: Auto-closing ${ticketsToClose.length} inactive tickets.`);

        for (const ticket of ticketsToClose) {
            ticket.isClosed = true;
            ticket.closedAt = new Date();
            ticket.status = 'CLOSED';
            await ticket.save();

            await TicketActivity.create({
                ticket: ticket._id,
                action: 'CLOSED',
                performedBy: null, // System action
                newValue: 'AUTO_CLOSED_BY_SYSTEM'
            });
        }
    } catch (error) {
        console.error('Error in auto-close cron:', error);
    }
};

/**
 * Process renewal invoices for services due for renewal
 */
export const processBillingRenewals = async () => {
    try {
        console.log('Cron: Processing billing renewals...');
        const result = await processRenewalInvoices();
        console.log(`Cron: Created ${result.invoicesCreated} renewal invoices.`);
        if (result.errors.length > 0) {
            console.error('Cron: Invoice creation errors:', result.errors);
        }
    } catch (error) {
        console.error('Error in billing renewal cron:', error);
    }
};

/**
 * Suspend overdue services
 */
export const suspendOverdueServicesCron = async () => {
    try {
        console.log('Cron: Suspending overdue services...');
        const result = await suspendOverdueServices();
        console.log(`Cron: Suspended ${result.suspendedCount} overdue services.`);
    } catch (error) {
        console.error('Error in suspend overdue services cron:', error);
    }
};

/**
 * Update overdue invoice statuses
 */
export const updateOverdueInvoices = async () => {
    try {
        const Invoice = (await import('../modules/billing/models/Invoice.js')).default;
        
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - 7); // 7 days after due date
        
        const result = await Invoice.updateMany(
            { 
                status: 'unpaid', 
                dueDate: { $lt: overdueDate } 
            },
            { 
                status: 'overdue' 
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`Cron: Marked ${result.modifiedCount} invoices as overdue.`);
        }
    } catch (error) {
        console.error('Error in overdue invoice cron:', error);
    }
};

export const initCrons = () => {
    // Auto-close tickets - daily at midnight
    cron.schedule('0 0 * * *', autoCloseTickets);

    // Billing - check renewals every 6 hours
    cron.schedule('0 */6 * * *', processBillingRenewals);

    // Suspend overdue services - every 12 hours
    cron.schedule('0 */12 * * *', suspendOverdueServicesCron);

    // Update overdue invoices - daily at 1 AM
    cron.schedule('0 1 * * *', updateOverdueInvoices);

    console.log('Cron jobs initialized with node-cron');

    // Run initial check after 30 seconds of server startup
    setTimeout(() => {
        autoCloseTickets();
        processBillingRenewals();
        suspendOverdueServicesCron();
        updateOverdueInvoices();
    }, 30 * 1000);
};
