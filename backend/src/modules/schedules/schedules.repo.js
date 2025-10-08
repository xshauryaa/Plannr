import { db } from '../../config/db.js';
import { schedules, blocks, users } from '../../db/schema.js';
import { eq, and, gte, lte, isNull, desc, asc, sql } from 'drizzle-orm';

/**
 * Schedules Repository
 * Handles database operations for schedules and blocks with Time24 format
 */

// Helper functions for ScheduleDate and Time24 conversion
const parseTime24 = (timeValue) => {
    if (typeof timeValue === 'number') return timeValue;
    if (typeof timeValue === 'string') return parseInt(timeValue, 10);
    return timeValue;
};

const convertScheduleDateToISO = (scheduleDate) => {
    if (!scheduleDate) return null;
    
    // If it's already an ISO string, return as is
    if (typeof scheduleDate === 'string') return scheduleDate;
    
    // If it's a ScheduleDate object {date: 7, month: 10, year: 2025}
    if (scheduleDate.date && scheduleDate.month && scheduleDate.year) {
        const isoString = `${scheduleDate.year}-${scheduleDate.month.toString().padStart(2, '0')}-${scheduleDate.date.toString().padStart(2, '0')}`;
        return isoString;
    }
    
    return null;
};

const formatDateForDb = (dateValue) => {
    if (!dateValue) return null;
    
    // Convert ScheduleDate object or ISO string to Date object for database
    const isoString = convertScheduleDateToISO(dateValue);
    return isoString ? new Date(isoString + 'T00:00:00.000Z') : null;
};

const convertDateToScheduleDate = (date) => {
    if (!date) return null;
    
    const dateObj = new Date(date);
    return {
        date: dateObj.getDate(),
        month: dateObj.getMonth() + 1, // getMonth() is 0-indexed
        year: dateObj.getFullYear()
    };
};

// Schedule operations
export const createSchedule = async (scheduleData) => {
    const insertData = {
        title: scheduleData.title,
        ownerId: scheduleData.ownerId,
        isActive: scheduleData.isActive || false,
        numDays: scheduleData.numDays || 7,
        minGap: scheduleData.minGap || 15,
        workingHoursLimit: scheduleData.workingHoursLimit || 8,
        strategy: scheduleData.strategy || 'EarliestFit',
        startTime: parseTime24(scheduleData.startTime) || 900,
        endTime: parseTime24(scheduleData.endTime) || 1700,
        metadata: scheduleData.metadata || {}
    };

    // Handle period-based scheduling
    if (scheduleData.periodStart && scheduleData.periodEnd) {
        insertData.periodStart = formatDateForDb(scheduleData.periodStart);
        insertData.periodEnd = formatDateForDb(scheduleData.periodEnd);
    }

    // Handle day1-based scheduling (your frontend Schedule model)
    if (scheduleData.day1Date) {
        insertData.day1Date = scheduleData.day1Date; // Store as ScheduleDate object
        insertData.day1Day = scheduleData.day1Day;
        
        // Also set period dates for compatibility
        if (!insertData.periodStart) {
            insertData.periodStart = formatDateForDb(scheduleData.day1Date);
            // Calculate period end based on numDays
            const startDate = formatDateForDb(scheduleData.day1Date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + (scheduleData.numDays || 7) - 1);
            insertData.periodEnd = endDate;
        }
    }

    const [newSchedule] = await db.insert(schedules).values(insertData).returning();
    return newSchedule;
};

export const getScheduleById = async (scheduleId, includeBlocks = false) => {
    try {
        const [schedule] = await db
            .select()
            .from(schedules)
            .where(and(
                eq(schedules.id, scheduleId),
                isNull(schedules.deletedAt)
            ))
            .limit(1);

        if (!schedule) return null;

        if (includeBlocks) {
            const scheduleBlocks = await getBlocksByScheduleId(scheduleId);
            return {
                ...schedule,
                blocks: scheduleBlocks
            };
        }

        return schedule;
    } catch (error) {
        throw new Error(`Failed to get schedule: ${error.message}`);
    }
};

export const getSchedulesByUserId = async (userId, options = {}) => {
    const { 
        since, 
        limit = 20, 
        cursor, 
        isActive,
        includeBlocks = false 
    } = options;
    
    try {
        let query = db
            .select()
            .from(schedules)
            .where(and(
                eq(schedules.ownerId, userId),
                isNull(schedules.deletedAt)
            ));

        // Add filters
        if (isActive !== undefined) {
            query = query.where(eq(schedules.isActive, isActive));
        }

        if (since) {
            query = query.where(gte(schedules.updatedAt, new Date(since)));
        }

        if (cursor) {
            query = query.where(gte(schedules.updatedAt, new Date(cursor)));
        }

        // Add ordering and limit
        query = query.orderBy(desc(schedules.updatedAt)).limit(limit);

        const results = await query;

        if (includeBlocks) {
            const schedulesWithBlocks = await Promise.all(
                results.map(async (schedule) => {
                    const scheduleBlocks = await getBlocksByScheduleId(schedule.id);
                    return {
                        ...schedule,
                        blocks: scheduleBlocks
                    };
                })
            );
            return schedulesWithBlocks;
        }

        return results;
    } catch (error) {
        throw new Error(`Failed to get schedules: ${error.message}`);
    }
};

export const updateSchedule = async (scheduleId, updateData) => {
    try {
        const updateFields = { updatedAt: new Date() };
        
        // Handle each field with proper conversion
        if (updateData.title !== undefined) updateFields.title = updateData.title;
        if (updateData.periodStart !== undefined) updateFields.periodStart = formatDateForDb(updateData.periodStart);
        if (updateData.periodEnd !== undefined) updateFields.periodEnd = formatDateForDb(updateData.periodEnd);
        if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
        if (updateData.numDays !== undefined) updateFields.numDays = updateData.numDays;
        if (updateData.minGap !== undefined) updateFields.minGap = updateData.minGap;
        if (updateData.workingHoursLimit !== undefined) updateFields.workingHoursLimit = updateData.workingHoursLimit;
        if (updateData.strategy !== undefined) updateFields.strategy = updateData.strategy;
        if (updateData.startTime !== undefined) updateFields.startTime = parseTime24(updateData.startTime);
        if (updateData.endTime !== undefined) updateFields.endTime = parseTime24(updateData.endTime);
        if (updateData.metadata !== undefined) updateFields.metadata = updateData.metadata;

        const [updatedSchedule] = await db
            .update(schedules)
            .set(updateFields)
            .where(and(
                eq(schedules.id, scheduleId),
                isNull(schedules.deletedAt)
            ))
            .returning();

        return updatedSchedule;
    } catch (error) {
        throw new Error(`Failed to update schedule: ${error.message}`);
    }
};

export const deleteSchedule = async (scheduleId) => {
    try {
        const [deletedSchedule] = await db
            .update(schedules)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date()
            })
            .where(and(
                eq(schedules.id, scheduleId),
                isNull(schedules.deletedAt)
            ))
            .returning();

        return deletedSchedule;
    } catch (error) {
        throw new Error(`Failed to delete schedule: ${error.message}`);
    }
};

// Block operations
export const createBlock = async (blockData) => {
    const {
        scheduleId,
        type,
        title,
        startAt,
        endAt,
        blockDate,
        date, // Alternative field name
        category,
        metadata = {},
        priority,
        deadline,
        duration,
        frontendId,
        completed = false
    } = blockData;

    try {
        // Use blockDate or date field
        const dateValue = blockDate || date;
        
        const insertData = {
            scheduleId,
            type,
            title,
            startAt: parseTime24(startAt),
            endAt: parseTime24(endAt),
            category,
            metadata,
            priority,
            duration,
            frontendId,
            completed
        };

        // Handle date - support both ScheduleDate object and ISO string
        if (dateValue) {
            insertData.blockDate = formatDateForDb(dateValue);
            // Store ScheduleDate object if provided
            if (typeof dateValue === 'object' && dateValue.date && dateValue.month && dateValue.year) {
                insertData.dateObject = dateValue;
            }
        } else {
            // Default to today if no date provided
            insertData.blockDate = new Date();
        }

        // Handle deadline - support both ScheduleDate object and ISO string
        if (deadline) {
            insertData.deadline = formatDateForDb(deadline);
            // Store ScheduleDate object if provided
            if (typeof deadline === 'object' && deadline.date && deadline.month && deadline.year) {
                insertData.deadlineObject = deadline;
            }
        }

        const [newBlock] = await db.insert(blocks).values(insertData).returning();

        return newBlock;
    } catch (error) {
        throw new Error(`Failed to create block: ${error.message}`);
    }
};

export const createMultipleBlocks = async (blocksData) => {
    try {
        const newBlocks = await db.insert(blocks).values(blocksData).returning();
        return newBlocks;
    } catch (error) {
        throw new Error(`Failed to create multiple blocks: ${error.message}`);
    }
};

export const getBlocksByScheduleId = async (scheduleId) => {
    try {
        const scheduleBlocks = await db
            .select()
            .from(blocks)
            .where(and(
                eq(blocks.scheduleId, scheduleId),
                isNull(blocks.deletedAt)
            ))
            .orderBy(asc(blocks.blockDate), asc(blocks.startAt));

        return scheduleBlocks;
    } catch (error) {
        throw new Error(`Failed to get blocks: ${error.message}`);
    }
};

export const getBlockById = async (blockId) => {
    try {
        const [block] = await db
            .select()
            .from(blocks)
            .where(and(
                eq(blocks.id, blockId),
                isNull(blocks.deletedAt)
            ))
            .limit(1);

        return block || null;
    } catch (error) {
        throw new Error(`Failed to get block: ${error.message}`);
    }
};

export const updateBlock = async (blockId, updateData) => {
    try {
        const updateFields = { updatedAt: new Date() };
        
        // Handle each field with proper conversion
        if (updateData.type !== undefined) updateFields.type = updateData.type;
        if (updateData.title !== undefined) updateFields.title = updateData.title;
        if (updateData.startAt !== undefined) updateFields.startAt = parseTime24(updateData.startAt);
        if (updateData.endAt !== undefined) updateFields.endAt = parseTime24(updateData.endAt);
        if (updateData.blockDate !== undefined) updateFields.blockDate = formatDateForDb(updateData.blockDate);
        if (updateData.category !== undefined) updateFields.category = updateData.category;
        if (updateData.metadata !== undefined) updateFields.metadata = updateData.metadata;
        if (updateData.priority !== undefined) updateFields.priority = updateData.priority;
        if (updateData.deadline !== undefined) updateFields.deadline = updateData.deadline ? formatDateForDb(updateData.deadline) : null;
        if (updateData.duration !== undefined) updateFields.duration = updateData.duration;
        if (updateData.frontendId !== undefined) updateFields.frontendId = updateData.frontendId;
        if (updateData.completed !== undefined) updateFields.completed = updateData.completed;

        const [updatedBlock] = await db
            .update(blocks)
            .set(updateFields)
            .where(and(
                eq(blocks.id, blockId),
                isNull(blocks.deletedAt)
            ))
            .returning();

        return updatedBlock;
    } catch (error) {
        throw new Error(`Failed to update block: ${error.message}`);
    }
};

export const deleteBlock = async (blockId) => {
    try {
        const [deletedBlock] = await db
            .update(blocks)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date()
            })
            .where(and(
                eq(blocks.id, blockId),
                isNull(blocks.deletedAt)
            ))
            .returning();

        return deletedBlock;
    } catch (error) {
        throw new Error(`Failed to delete block: ${error.message}`);
    }
};

export const getScheduleWithOwner = async (scheduleId) => {
    try {
        const result = await db
            .select({
                schedule: schedules,
                owner: users
            })
            .from(schedules)
            .innerJoin(users, eq(schedules.ownerId, users.id))
            .where(and(
                eq(schedules.id, scheduleId),
                isNull(schedules.deletedAt)
            ))
            .limit(1);

        return result.length ? result[0] : null;
    } catch (error) {
        throw new Error(`Failed to get schedule with owner: ${error.message}`);
    }
};

export const getBlocksInDateRange = async (scheduleId, startDate, endDate) => {
    try {
        const scheduleBlocks = await db
            .select()
            .from(blocks)
            .where(and(
                eq(blocks.scheduleId, scheduleId),
                isNull(blocks.deletedAt),
                gte(blocks.blockDate, formatDateForDb(startDate)),
                lte(blocks.blockDate, formatDateForDb(endDate))
            ))
            .orderBy(asc(blocks.blockDate), asc(blocks.startAt));

        return scheduleBlocks;
    } catch (error) {
        throw new Error(`Failed to get blocks in date range: ${error.message}`);
    }
};

export const markBlockAsCompleted = async (blockId, completed = true) => {
    try {
        const [updatedBlock] = await db
            .update(blocks)
            .set({
                completed,
                updatedAt: new Date()
            })
            .where(and(
                eq(blocks.id, blockId),
                isNull(blocks.deletedAt)
            ))
            .returning();

        return updatedBlock;
    } catch (error) {
        throw new Error(`Failed to mark block as completed: ${error.message}`);
    }
};