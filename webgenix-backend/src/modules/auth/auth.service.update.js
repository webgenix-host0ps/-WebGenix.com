import User from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';

export const updateUser = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    return user.toObject();
};
