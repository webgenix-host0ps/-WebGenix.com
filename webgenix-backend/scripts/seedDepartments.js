import mongoose from 'mongoose';
import Department from '../src/modules/tickets/models/Department.js';
import { env } from '../src/config/env.js';

const departments = [
    { _id: '662b1f1a1c4b2a1f1a1c4b2a', name: 'General Support', email: 'support@webgenix.host' },
    { _id: '662b1f1a1c4b2a1f1a1c4b2b', name: 'Billing', email: 'billing@webgenix.host' },
    { _id: '662b1f1a1c4b2a1f1a1c4b2c', name: 'Technical Support', email: 'tech@webgenix.host' }
];

async function seedDepartments() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const dept of departments) {
            await Department.findOneAndUpdate(
                { _id: dept._id },
                dept,
                { upsert: true, new: true }
            );
            console.log(`Seeded: ${dept.name}`);
        }

        console.log('Departments seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedDepartments();
