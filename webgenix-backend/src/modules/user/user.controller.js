import { asyncHandler } from '../../utils/asyncHandler.js';
import * as userService from './user.service.js';

export const getProfile = asyncHandler(async (req, res) => {
    // req.user already populated by authMiddleware
    res.json({ success: true, data: { user: req.user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json({ success: true, data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
    await userService.changePassword(req.userId, req.body.oldPassword, req.body.newPassword, req);
    res.json({ success: true, message: 'Password changed successfully' });
});