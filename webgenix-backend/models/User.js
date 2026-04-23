import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const billingAddressSchema = new Schema({
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
}, { _id: false });

const clientProfileSchema = new Schema({
    company: String,
    gstin: String,
    billingAddress: billingAddressSchema,
    currency: { type: String, default: 'INR' }
}, { _id: false });

const userSchema = new Schema({
    // 🔐 Auth
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },

    // 👤 Basic Info
    name: String,
    phone: String,
    avatar: String,

    // 🎭 Role
    role: {
        type: String,
        enum: ['client', 'admin', 'support', 'billing'],
        default: 'client',
        index: true,
    },

    // 🧠 Optional permissions
    permissions: [String],

    // 📊 Status
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },

    // 🔐 Security
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    backupCodes: [String],

    // 🧾 Client profile
    clientProfile: clientProfileSchema,

    // 📍 Tracking
    lastLogin: Date,
    lastLoginIp: String,

}, { timestamps: true });


// 🔐 Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// 🔑 Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.model('User', userSchema);