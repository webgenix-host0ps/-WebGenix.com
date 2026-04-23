import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';

export const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new ApiError(404, 'User not found');
    return user;
};

export const updateProfile = async (userId, updates) => {
    const allowedUpdates = ['name', 'phone', 'avatar'];
    const updateData = {};
    Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) updateData[key] = updates[key];
    });

    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select('-password');

    return user;
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new ApiError(404, 'User not found');

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();
    return true;
};