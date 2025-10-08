import { z } from 'zod';

/**
 * Schedule and Block Validation Schemas
 * Updated to match frontend models and serializers
 */

// ScheduleDate validation schema to match your frontend model
const ScheduleDateSchema = z.object({
    date: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12), 
    year: z.number().int().min(1900).max(3000)
});

// Alternative: accept either ScheduleDate object or ISO string
const FlexibleDateSchema = z.union([
    ScheduleDateSchema,
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format or ScheduleDate object')
]);

// Frontend enum validation
const ActivityTypeEnum = z.enum([
    'PERSONAL', 'MEETING', 'WORK', 'EVENT', 'EDUCATION', 
    'TRAVEL', 'RECREATIONAL', 'ERRAND', 'OTHER', 'BREAK'
]);

const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// Time24 format validation - supports 3-4 digit format (e.g., 930, 1745)
const Time24Schema = z.union([
    z.number().int().min(0).max(2359),
    z.string().regex(/^\d{3,4}$/).transform(val => parseInt(val, 10))
]).refine(val => {
    const hour = Math.floor(val / 100);
    const minute = val % 100;
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}, { message: 'Invalid time format. Must be HHMM or HMM (e.g., 930, 1745)' });

// Schedule validation schemas - updated to match frontend Schedule model
export const createScheduleSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    // Support both your frontend format and simple ISO dates
    periodStart: FlexibleDateSchema.optional(),
    periodEnd: FlexibleDateSchema.optional(),
    // Your frontend Schedule model fields
    day1Date: FlexibleDateSchema.optional(),
    day1Day: z.string().optional(), // "Monday", "Tuesday", etc.
    isActive: z.boolean().optional().default(false),
    numDays: z.number().int().min(1).max(365).optional().default(7),
    minGap: z.number().int().min(0).optional().default(15),
    workingHoursLimit: z.number().int().min(1).max(24).optional().default(8),
    strategy: z.enum(['EarliestFit', 'BalancedWork', 'DeadlineOriented']).optional().default('EarliestFit'),
    startTime: Time24Schema.optional().default(900), // 9:00 AM
    endTime: Time24Schema.optional().default(1700), // 5:00 PM
    metadata: z.object({}).optional()
}).refine(data => {
    // Ensure either periodStart/periodEnd OR day1Date is provided
    const hasPeriod = data.periodStart && data.periodEnd;
    const hasDay1 = data.day1Date;
    return hasPeriod || hasDay1;
}, {
    message: "Either periodStart/periodEnd or day1Date must be provided"
});

export const updateScheduleSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    periodStart: FlexibleDateSchema.optional(),
    periodEnd: FlexibleDateSchema.optional(),
    day1Date: FlexibleDateSchema.optional(),
    day1Day: z.string().optional(),
    isActive: z.boolean().optional(),
    numDays: z.number().int().min(1).max(365).optional(),
    minGap: z.number().int().min(0).optional(),
    workingHoursLimit: z.number().int().min(1).max(24).optional(),
    strategy: z.enum(['EarliestFit', 'BalancedWork', 'DeadlineOriented']).optional(),
    startTime: Time24Schema.optional(),
    endTime: Time24Schema.optional(),
    metadata: z.object({}).optional()
});

// Block validation schemas - updated to match frontend TimeBlock structure
export const createBlockSchema = z.object({
    type: z.enum(['rigid', 'flexible', 'break']),
    title: z.string().min(1, 'Title is required'), // This maps to 'name' in frontend
    startAt: Time24Schema, // Time24 format
    endAt: Time24Schema,   // Time24 format
    // Support both ScheduleDate object and ISO string for date
    blockDate: FlexibleDateSchema.optional(),
    date: FlexibleDateSchema.optional(), // Alternative field name from frontend
    category: ActivityTypeEnum.optional(),
    metadata: z.object({
        activityType: ActivityTypeEnum.optional(),
        priority: PriorityEnum.optional(),
        deadline: FlexibleDateSchema.optional(),
        duration: z.number().int().min(1).optional(),
        frontendId: z.string().optional() // Support for frontend-generated IDs
    }).optional(),
    completed: z.boolean().optional().default(false),
    // Support for flexible event specific fields
    priority: PriorityEnum.optional(),
    deadline: FlexibleDateSchema.optional(),
    // Support for duration (calculated from times but can be provided)
    duration: z.number().int().min(1).optional()
});

export const createMultipleBlocksSchema = z.object({
    blocks: z.array(createBlockSchema).min(1, 'At least one block is required')
});

export const updateBlockSchema = z.object({
    type: z.enum(['rigid', 'flexible', 'break']).optional(),
    title: z.string().min(1, 'Title is required').optional(),
    startAt: Time24Schema.optional(),
    endAt: Time24Schema.optional(),
    blockDate: FlexibleDateSchema.optional(),
    date: FlexibleDateSchema.optional(),
    category: ActivityTypeEnum.optional(),
    metadata: z.object({
        activityType: ActivityTypeEnum.optional(),
        priority: PriorityEnum.optional(),
        deadline: FlexibleDateSchema.optional(),
        duration: z.number().int().min(1).optional(),
        frontendId: z.string().optional()
    }).optional(),
    completed: z.boolean().optional(),
    priority: PriorityEnum.optional(),
    deadline: FlexibleDateSchema.optional(),
    duration: z.number().int().min(1).optional()
});

// Diff operations schema for bulk updates
export const diffOpsSchema = z.object({
    operations: z.array(z.object({
        action: z.enum(['add', 'update', 'delete']),
        blockId: z.string().uuid().optional(), // Required for update/delete
        data: z.union([createBlockSchema, updateBlockSchema]).optional() // Required for add/update
    })).min(1, 'At least one operation is required')
});

// Query parameter schemas - updated for Time24 format
export const getSchedulesQuerySchema = z.object({
    since: z.string().datetime().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    cursor: z.string().datetime().optional(),
    isActive: z.coerce.boolean().optional(),
    includeBlocks: z.coerce.boolean().optional().default(false)
});

export const dateRangeQuerySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
});

// Parameter validation schemas
export const scheduleIdParamSchema = z.object({
    id: z.string().uuid('Valid schedule ID is required')
});

export const blockIdParamSchema = z.object({
    blockId: z.string().uuid('Valid block ID is required')
});

export const scheduleAndBlockIdParamSchema = z.object({
    id: z.string().uuid('Valid schedule ID is required'),
    blockId: z.string().uuid('Valid block ID is required')
});

// Validation middleware functions
export const validateCreateSchedule = (req, res, next) => {
    try {
        req.validatedData = createScheduleSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateUpdateSchedule = (req, res, next) => {
    try {
        req.validatedData = updateScheduleSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateCreateBlock = (req, res, next) => {
    try {
        req.validatedData = createBlockSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateCreateMultipleBlocks = (req, res, next) => {
    try {
        req.validatedData = createMultipleBlocksSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateUpdateBlock = (req, res, next) => {
    try {
        req.validatedData = updateBlockSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateDiffOps = (req, res, next) => {
    try {
        req.validatedData = diffOpsSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateGetSchedulesQuery = (req, res, next) => {
    try {
        req.validatedQuery = getSchedulesQuerySchema.parse(req.query);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Query validation failed',
            errors: error.errors
        });
    }
};

export const validateDateRangeQuery = (req, res, next) => {
    try {
        req.validatedQuery = dateRangeQuerySchema.parse(req.query);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Query validation failed',
            errors: error.errors
        });
    }
};

export const validateScheduleIdParam = (req, res, next) => {
    try {
        req.validatedParams = scheduleIdParamSchema.parse(req.params);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid schedule ID',
            errors: error.errors
        });
    }
};

export const validateBlockIdParam = (req, res, next) => {
    try {
        req.validatedParams = blockIdParamSchema.parse(req.params);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid block ID',
            errors: error.errors
        });
    }
};

// Additional validators for routes
export const saveNewScheduleValidator = validateCreateSchedule;
export const getSchedulesValidator = validateGetSchedulesQuery;
export const getScheduleByIdValidator = validateScheduleIdParam;
export const updateScheduleValidator = validateUpdateSchedule;
export const deleteScheduleValidator = validateScheduleIdParam;
export const addBlocksValidator = (req, res, next) => {
    // Check if it's multiple blocks or single block
    if (req.body.blocks) {
        return validateCreateMultipleBlocks(req, res, next);
    } else {
        return validateCreateBlock(req, res, next);
    }
};
export const updateBlockValidator = validateUpdateBlock;
export const deleteBlockValidator = validateBlockIdParam;
export const applyOpsValidator = validateDiffOps;
export const getBlocksInDateRangeValidator = validateDateRangeQuery;
export const markBlockCompletedValidator = validateBlockIdParam;