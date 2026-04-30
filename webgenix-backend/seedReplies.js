import mongoose from 'mongoose';
import PredefinedReply from './src/modules/tickets/models/PredefinedReply.js';
import { env } from './src/config/env.js';

const seedReplies = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const replies = [
            {
                title: 'General Welcome',
                content: 'Hello, thank you for contacting WebGenix Support. We have received your request and our team is looking into it. We will get back to you shortly.',
            },
            {
                title: 'Technical Issue - Investigation',
                content: 'Hello, we are investigating the technical issue you reported. Our engineers are currently checking the server logs. We appreciate your patience.',
            },
            {
                title: 'Billing - Payment Received',
                content: 'Hello, we have successfully received your payment. Your services have been renewed. Thank you for choosing WebGenix!',
            },
            {
                title: 'Account Closure Confirmation',
                content: 'Hello, as requested, your account has been scheduled for closure. We are sorry to see you go. If you change your mind, please let us know within 30 days.',
            }
        ];

        for (const reply of replies) {
            const exists = await PredefinedReply.findOne({ title: reply.title });
            if (!exists) {
                await PredefinedReply.create(reply);
                console.log(`Created reply: ${reply.title}`);
            }
        }

        console.log('Seeding replies completed!');
    } catch (error) {
        console.error('Error seeding replies:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seedReplies();
