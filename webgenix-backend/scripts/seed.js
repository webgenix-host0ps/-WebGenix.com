import mongoose from 'mongoose';
import { seedDepartments } from '../src/seeders/department.seeder.js';
import { seedSettings } from '../src/seeders/settings.seeder.js';
import { env } from '../src/config/env.js';

async function seed() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        await seedDepartments();
        await seedSettings();
        
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
