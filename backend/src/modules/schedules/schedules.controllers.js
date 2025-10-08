import * as repo from './schedules.repo.js';
import * as userRepo from '../users/users.repo.js';

/**
 * Schedule Controllers
 * Handles schedule and block HTTP requests
 */

export const saveNewSchedule = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const scheduleData = {
            ...req.validated.body,
            ownerId: user.id
        };

        const newSchedule = await repo.createSchedule(scheduleData);

        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            data: newSchedule
        });
    } catch (error) {
        next(error);
    }
};

export const getSchedules = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const options = req.validated?.query || {};
        const schedules = await repo.getSchedulesByUserId(user.id, options);

        res.status(200).json({
            success: true,
            data: schedules,
            message: 'Schedules retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getScheduleById = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const includeBlocks = req.query.includeBlocks === 'true';
        const schedule = await repo.getScheduleById(id, includeBlocks);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        // Check if user owns this schedule
        if (schedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: schedule,
            message: 'Schedule retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateSchedule = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const updateData = req.validated.body;
        const updatedSchedule = await repo.updateSchedule(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Schedule updated successfully',
            data: updatedSchedule
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSchedule = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await repo.deleteSchedule(id);

        res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const addBlocks = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Handle both single block and multiple blocks
        const validatedData = req.validated.body;
        let newBlocks;

        if (validatedData.blocks) {
            // Multiple blocks
            const blocksWithScheduleId = validatedData.blocks.map(block => ({
                ...block,
                scheduleId: id,
                // Extract date from the request or use current date
                blockDate: block.blockDate || new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                // Set metadata fields
                category: block.category || block.metadata?.activityType,
                priority: block.priority || block.metadata?.priority,
                deadline: block.deadline || block.metadata?.deadline,
                duration: block.duration || block.metadata?.duration,
                frontendId: block.metadata?.frontendId
            }));
            newBlocks = await repo.createMultipleBlocks(blocksWithScheduleId);
        } else {
            // Single block
            const blockData = {
                ...validatedData,
                scheduleId: id,
                blockDate: validatedData.blockDate || new Date().toISOString().split('T')[0],
                category: validatedData.category || validatedData.metadata?.activityType,
                priority: validatedData.priority || validatedData.metadata?.priority,
                deadline: validatedData.deadline || validatedData.metadata?.deadline,
                duration: validatedData.duration || validatedData.metadata?.duration,
                frontendId: validatedData.metadata?.frontendId
            };
            newBlocks = [await repo.createBlock(blockData)];
        }

        res.status(201).json({
            success: true,
            message: 'Blocks added successfully',
            data: newBlocks
        });
    } catch (error) {
        next(error);
    }
};

export const updateBlock = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id, blockId } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if block exists
        const existingBlock = await repo.getBlockById(blockId);
        if (!existingBlock) {
            return res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }

        if (existingBlock.scheduleId !== id) {
            return res.status(400).json({
                success: false,
                message: 'Block does not belong to this schedule'
            });
        }

        const updateData = req.validated.body;
        
        // Set metadata fields if provided
        if (updateData.metadata) {
            if (updateData.metadata.activityType && !updateData.category) {
                updateData.category = updateData.metadata.activityType;
            }
            if (updateData.metadata.priority && !updateData.priority) {
                updateData.priority = updateData.metadata.priority;
            }
            if (updateData.metadata.deadline && !updateData.deadline) {
                updateData.deadline = updateData.metadata.deadline;
            }
            if (updateData.metadata.duration && !updateData.duration) {
                updateData.duration = updateData.metadata.duration;
            }
            if (updateData.metadata.frontendId) {
                updateData.frontendId = updateData.metadata.frontendId;
            }
        }

        const updatedBlock = await repo.updateBlock(blockId, updateData);

        res.status(200).json({
            success: true,
            message: 'Block updated successfully',
            data: updatedBlock
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBlock = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id, blockId } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if block exists
        const existingBlock = await repo.getBlockById(blockId);
        if (!existingBlock) {
            return res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }

        if (existingBlock.scheduleId !== id) {
            return res.status(400).json({
                success: false,
                message: 'Block does not belong to this schedule'
            });
        }

        await repo.deleteBlock(blockId);

        res.status(200).json({
            success: true,
            message: 'Block deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const applyOps = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const { operations } = req.validated.body;
        const results = {
            added: [],
            updated: [],
            deleted: []
        };

        // Process operations sequentially to maintain consistency
        for (const operation of operations) {
            const { action, blockId, data } = operation;

            switch (action) {
                case 'add':
                    if (!data) {
                        throw new Error('Data is required for add operation');
                    }
                    const blockData = {
                        ...data,
                        scheduleId: id,
                        blockDate: data.blockDate || new Date().toISOString().split('T')[0],
                        category: data.category || data.metadata?.activityType,
                        priority: data.priority || data.metadata?.priority,
                        deadline: data.deadline || data.metadata?.deadline,
                        duration: data.duration || data.metadata?.duration,
                        frontendId: data.metadata?.frontendId
                    };
                    const newBlock = await repo.createBlock(blockData);
                    results.added.push(newBlock);
                    break;

                case 'update':
                    if (!blockId || !data) {
                        throw new Error('Block ID and data are required for update operation');
                    }
                    
                    // Verify block belongs to this schedule
                    const blockToUpdate = await repo.getBlockById(blockId);
                    if (!blockToUpdate || blockToUpdate.scheduleId !== id) {
                        throw new Error(`Block ${blockId} not found in this schedule`);
                    }

                    const updateData = { ...data };
                    // Set metadata fields if provided
                    if (updateData.metadata) {
                        if (updateData.metadata.activityType && !updateData.category) {
                            updateData.category = updateData.metadata.activityType;
                        }
                        if (updateData.metadata.priority && !updateData.priority) {
                            updateData.priority = updateData.metadata.priority;
                        }
                        if (updateData.metadata.deadline && !updateData.deadline) {
                            updateData.deadline = updateData.metadata.deadline;
                        }
                        if (updateData.metadata.duration && !updateData.duration) {
                            updateData.duration = updateData.metadata.duration;
                        }
                        if (updateData.metadata.frontendId) {
                            updateData.frontendId = updateData.metadata.frontendId;
                        }
                    }

                    const updatedBlock = await repo.updateBlock(blockId, updateData);
                    results.updated.push(updatedBlock);
                    break;

                case 'delete':
                    if (!blockId) {
                        throw new Error('Block ID is required for delete operation');
                    }

                    // Verify block belongs to this schedule
                    const blockToDelete = await repo.getBlockById(blockId);
                    if (!blockToDelete || blockToDelete.scheduleId !== id) {
                        throw new Error(`Block ${blockId} not found in this schedule`);
                    }

                    const deletedBlock = await repo.deleteBlock(blockId);
                    results.deleted.push(deletedBlock);
                    break;

                default:
                    throw new Error(`Unknown operation: ${action}`);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Operations applied successfully',
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// Additional helper endpoints
export const getBlocksInDateRange = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id } = req.validated.params || req.params;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const { startDate, endDate } = req.validated.query;
        const blocks = await repo.getBlocksInDateRange(
            id, 
            startDate, // Already in YYYY-MM-DD format from validation
            endDate    // Already in YYYY-MM-DD format from validation
        );

        res.status(200).json({
            success: true,
            data: blocks,
            message: 'Blocks retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const markBlockCompleted = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        const { id, blockId } = req.validated.params || req.params;
        const { completed = true } = req.body;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get user from Clerk ID
        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if schedule exists and user owns it
        const existingSchedule = await repo.getScheduleById(id);
        if (!existingSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        if (existingSchedule.ownerId !== user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if block exists and belongs to schedule
        const existingBlock = await repo.getBlockById(blockId);
        if (!existingBlock || existingBlock.scheduleId !== id) {
            return res.status(404).json({
                success: false,
                message: 'Block not found'
            });
        }

        const updatedBlock = await repo.markBlockAsCompleted(blockId, completed);

        res.status(200).json({
            success: true,
            message: `Block marked as ${completed ? 'completed' : 'incomplete'}`,
            data: updatedBlock
        });
    } catch (error) {
        next(error);
    }
};