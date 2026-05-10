import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import User from '../src/models/User.js';

async function checkUsers() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).select('name email role isActive createdAt');
    
    console.log('\n=== ALL USERS IN DATABASE ===');
    console.log('Total users:', users.length);
    console.log('\nUsers:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} (${u.email}) - Role: ${u.role}, Active: ${u.isActive}`);
    });
    
    const clients = users.filter(u => u.role === 'client');
    console.log('\n=== CLIENTS ONLY ===');
    console.log('Total clients:', clients.length);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
