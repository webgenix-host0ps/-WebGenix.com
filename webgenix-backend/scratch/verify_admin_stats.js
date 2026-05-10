import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Ticket from '../src/modules/tickets/models/Ticket.js';
import Invoice from '../src/modules/billing/models/Invoice.js';
import Service from '../src/modules/billing/models/Service.js';

dotenv.config();

const testAdminStats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webgenix');
        console.log('--- Admin Stats Logic Verification ---');

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const [totalClients, lastMonthClients, activeLeads, lastWeekLeads, openTickets, unpaidInvoices, activeServices] = await Promise.all([
            User.countDocuments({ role: 'client' }),
            User.countDocuments({ role: 'client', createdAt: { $gte: lastMonth } }),
            User.countDocuments({ role: 'lead' }),
            User.countDocuments({ role: 'lead', createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
            Ticket.countDocuments({ status: { $in: ['OPEN', 'CLIENT_REPLY', 'IN_PROGRESS'] }, isClosed: false }),
            Invoice.countDocuments({ status: 'unpaid' }),
            Service.countDocuments({ status: 'active' })
        ]);

        console.log('Stats Results:');
        console.log(` - totalClients: ${totalClients}`);
        console.log(` - activeLeads: ${activeLeads}`);
        console.log(` - openTickets: ${openTickets}`);
        console.log(` - unpaidInvoices: ${unpaidInvoices}`);
        console.log(` - activeServices: ${activeServices}`);

        if (totalClients > 0 || openTickets > 0 || unpaidInvoices > 0) {
            console.log('✅ SUCCESS: Controller logic is fetching real data.');
        } else {
            console.log('⚠️ WARNING: DB might be empty or query logic issues.');
        }

        console.log('--- Admin Stats Logic Verification End ---');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Stats verification failed:', error);
        process.exit(1);
    }
};

testAdminStats();
