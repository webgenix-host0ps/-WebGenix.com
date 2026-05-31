import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const users = [
    { name: 'Client User', email: 'client@webgenix.in', role: 'client', emailVerified: true },
    { name: 'Support Staff', email: 'support@webgenix.in', role: 'support', emailVerified: true },
    { name: 'Admin User', email: 'admin@webgenix.in', role: 'admin', emailVerified: true },
    { name: 'Lead Manager', email: 'lead@webgenix.in', role: 'lead', emailVerified: true },
];

const PASSWORD = 'Webgenix@123!';

const seed = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webgenix';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        for (const u of users) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                console.log(`Skipping ${u.email} — already exists`);
                continue;
            }
            await User.create({
                ...u,
                password: hashedPassword,
                isActive: true,
                permissions: [],
                failedLoginAttempts: 0,
            });
            console.log(`Created ${u.role}: ${u.email}`);
        }

        console.log('\nAll users seeded. Password for all: ' + PASSWORD);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
};

seed();
