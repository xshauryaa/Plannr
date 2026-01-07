import { z } from 'zod';

/**
 * Integration Validation Schemas
 */

// Schema for Google Calendar export request
export const googleCalendarExportSchema = z.object({
    events: z.array(z.object({
        uid: z.string().min(1, 'Event UID is required'),
        title: z.string().min(1, 'Event title is required'),
        description: z.string().optional(),
        start: z.string().datetime('Invalid start datetime format'),
        end: z.string().datetime('Invalid end datetime format'),
        timeZone: z.string().optional()
    })).min(1, 'At least one event is required')
});

/**
 * Validation middleware
 */
export const validateGoogleCalendarExport = (req, res, next) => {
    try {
        const validatedData = googleCalendarExportSchema.parse(req.body);
        req.validatedData = validatedData;
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.errors?.map(err => ({
                field: err.path.join('.'),
                message: err.message
            })) || [{ message: error.message }]
        });
    }
};
