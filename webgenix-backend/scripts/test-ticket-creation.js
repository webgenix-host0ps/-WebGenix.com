import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import Department from '../src/modules/tickets/models/Department.js';
import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';

async function testTicketCreation() {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if departments exist
        const departments = await Department.find({ isActive: true });
        console.log(`✅ Found ${departments.length} departments`);
        departments.forEach(dept => console.log(`   - ${dept.name} (${dept._id})`));

        // Check if test user exists
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (testUser) {
            console.log(`✅ Test user found: ${testUser.name} (${testUser.role})`);
            
            // Generate test token
            const token = jwt.sign(
                { sub: testUser._id, email: testUser.email, role: testUser.role },
                env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            console.log(`✅ Test token generated: ${token.substring(0, 50)}...`);
        } else {
            console.log('⚠️  No test user found. Please create a test user first.');
        }

        console.log('\n🎉 Ticket creation test setup complete!');
        console.log('You can now test ticket creation in the browser.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testTicketCreation();
