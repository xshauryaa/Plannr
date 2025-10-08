import { z } from 'zod';

/**
 * User Validation Schemas
 */

export const createUserSchema = z.object({
    clerkUserId: z.string().min(1, 'Clerk User ID is required'),
    email: z.string().email('Valid email is required'),
    displayName: z.string().optional(),
    avatarUrl: z.string().url('Valid avatar URL required').optional(),
});

export const updateUserProfileSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').optional(),
    avatarUrl: z.string().url('Valid avatar URL required').optional(),
});

export const clerkWebhookSchema = z.object({
    type: z.string(),
    data: z.object({
        id: z.string(),
        email_addresses: z.array(z.object({
            email_address: z.string().email(),
            id: z.string(),
        })),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        image_url: z.string().optional(),
        profile_image_url: z.string().optional(),
    }),
});

export const userIdParamSchema = z.object({
    userId: z.string().uuid('Valid user ID is required'),
});

// Validate request body middleware
export const validateCreateUser = (req, res, next) => {
    try {
        req.validatedData = createUserSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors,
        });
    }
};

export const validateUpdateUserProfile = (req, res, next) => {
    try {
        req.validatedData = updateUserProfileSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.errors,
        });
    }
};

export const validateClerkWebhook = (req, res, next) => {
    try {
        req.validatedData = clerkWebhookSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid webhook payload',
            errors: error.errors,
        });
    }
};