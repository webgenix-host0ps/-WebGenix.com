import Server from './models/Server.js';
import ServerGroup from './models/ServerGroup.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// --- Server Controllers ---

export const getServers = asyncHandler(async (req, res) => {
    const servers = await Server.find().populate('serverGroupId', 'name').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, servers, 'Servers retrieved successfully'));
});

export const createServer = asyncHandler(async (req, res) => {
    const server = await Server.create(req.body);
    
    // If server belongs to a group, add it to the group's servers array
    if (server.serverGroupId) {
        await ServerGroup.findByIdAndUpdate(server.serverGroupId, {
            $addToSet: { servers: server._id }
        });
    }

    res.status(201).json(new ApiResponse(201, server, 'Server created successfully'));
});

export const updateServer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const server = await Server.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!server) throw new ApiError(404, 'Server not found');
    res.status(200).json(new ApiResponse(200, server, 'Server updated successfully'));
});

export const deleteServer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const server = await Server.findByIdAndDelete(id);
    if (!server) throw new ApiError(404, 'Server not found');

    // Remove from group if assigned
    if (server.serverGroupId) {
        await ServerGroup.findByIdAndUpdate(server.serverGroupId, {
            $pull: { servers: id }
        });
    }

    res.status(200).json(new ApiResponse(200, null, 'Server deleted successfully'));
});

// --- Server Group Controllers ---

export const getServerGroups = asyncHandler(async (req, res) => {
    const groups = await ServerGroup.find().populate('servers', 'name hostname status').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, groups, 'Server groups retrieved successfully'));
});

export const createServerGroup = asyncHandler(async (req, res) => {
    const group = await ServerGroup.create(req.body);
    res.status(201).json(new ApiResponse(201, group, 'Server group created successfully'));
});
