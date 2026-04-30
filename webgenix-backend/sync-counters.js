import mongoose from 'mongoose';
import Ticket from './src/modules/tickets/models/Ticket.js';
import Counter from './src/models/Counter.js';
import dotenv from 'dotenv';

dotenv.config();

const sync = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webgenix');
        console.log('Connected to MongoDB');

        const year = new Date().getFullYear();
        const counterId = `ticketId_${year}`;

        // Find the highest ticket ID for the current year
        const lastTicket = await Ticket.findOne({
            ticketId: new RegExp(`^TCK-${year}-`)
        }).sort({ ticketId: -1 });

        let maxSeq = 0;
        if (lastTicket && lastTicket.ticketId) {
            const parts = lastTicket.ticketId.split('-');
            if (parts.length === 3) {
                maxSeq = parseInt(parts[2], 10);
            }
        }

        console.log(`Highest sequence found for ${year}: ${maxSeq}`);

        // Update counter to match
        await Counter.findByIdAndUpdate(
            counterId,
            { $set: { seq: maxSeq } },
            { upsert: true, new: true }
        );

        console.log(`Counter ${counterId} synced to ${maxSeq}`);
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
};

sync();
