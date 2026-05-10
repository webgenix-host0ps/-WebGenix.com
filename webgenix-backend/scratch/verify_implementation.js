import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Ticket from '../src/modules/tickets/models/Ticket.js';
import Invoice from '../src/modules/billing/models/Invoice.js';
import Domain from '../src/modules/domains/models/Domain.js';
import Server from '../src/modules/servers/models/Server.js';

dotenv.config();

const testModels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webgenix');
        console.log('--- Model Verification Start ---');

        // Check if models are registered correctly
        const userCount = await User.countDocuments();
        console.log(`User model check: Found ${userCount} users`);

        const ticketCount = await Ticket.countDocuments();
        console.log(`Ticket model check: Found ${ticketCount} tickets`);

        const invoiceCount = await Invoice.countDocuments();
        console.log(`Invoice model check: Found ${invoiceCount} invoices`);

        const domainCount = await Domain.countDocuments();
        console.log(`Domain model check: Found ${domainCount} domains (New model)`);

        const serverCount = await Server.countDocuments();
        console.log(`Server model check: Found ${serverCount} servers (New model)`);

        // Test the new fields
        const sampleUser = await User.findOne();
        if (sampleUser) {
            console.log('User model fields check:');
            console.log(` - failedLoginAttempts: ${sampleUser.failedLoginAttempts}`);
            console.log(` - adminNotes: ${sampleUser.adminNotes}`);
        }

        const sampleInvoice = await Invoice.findOne();
        if (sampleInvoice) {
            console.log('Invoice model fields check:');
            console.log(` - taxBreakdown: ${JSON.stringify(sampleInvoice.taxBreakdown)}`);
        }

        console.log('--- Model Verification End ---');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

testModels();
