import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

const { Schema } = mongoose;

const billingAddressSchema = new Schema({
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
}, { _id: false });

const clientProfileSchema = new Schema({
    company: String,
    gstin: String,
    billingAddress: billingAddressSchema,
    currency: { type: String, default: 'INR' }
}, { _id: false });

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    phone: String,
    avatar: String,

    role: {
        type: String,
        enum: ['client', 'admin', 'support', 'billing', 'lead'],
        default: 'client',
        index: true,
    },
    permissions: [String],

    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    tempTwoFactorSecret: String,
    backupCodes: [String],

    clientProfile: clientProfileSchema,

    lastLogin: Date,
    lastLoginIp: String,

    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    adminNotes: String,
    creditBalance: { type: Number, default: 0 },

}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has specific permission
userSchema.methods.hasPermission = function (permission) {
    if (this.role === 'admin') return true;
    return this.permissions?.includes(permission) || false;
};

export default mongoose.model('User', userSchema);