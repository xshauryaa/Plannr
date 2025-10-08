import * as repo from './users.repo.js';

/**
 * User Controllers
 * Handles user-related HTTP requests
 */

export const createUser = async (req, res, next) => {
    try {
        const { clerkUserId, email, displayName, avatarUrl } = req.validatedData;

        // Check if user already exists
        const existingUser = await repo.getUserByClerkId(clerkUserId);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists',
                data: { userId: existingUser.id }
            });
        }

        // Create new user
        const newUser = await repo.createUser({
            clerkUserId,
            email,
            displayName,
            avatarUrl,
        });

        // Create default preferences for the user
        await repo.createDefaultPreferences(newUser.id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                userId: newUser.id,
                clerkUserId: newUser.clerkUserId,
                email: newUser.email,
                displayName: newUser.displayName,
                avatarUrl: newUser.avatarUrl,
                createdAt: newUser.createdAt,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req, res, next) => {
    try {
        // In a real app, you'd get the user ID from the authenticated user (JWT/session)
        // For now, we'll expect it as a query parameter or from auth middleware
        const clerkUserId = req.headers['x-clerk-user-id'] || req.query.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userWithPreferences = await repo.getUserByClerkId(clerkUserId);
        
        if (!userWithPreferences) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get full user data with preferences
        const fullUserData = await repo.getUserWithPreferences(userWithPreferences.id);

        res.status(200).json({
            success: true,
            data: {
                id: fullUserData.id,
                clerkUserId: fullUserData.clerkUserId,
                email: fullUserData.email,
                displayName: fullUserData.displayName,
                avatarUrl: fullUserData.avatarUrl,
                preferences: fullUserData.preferences,
                createdAt: fullUserData.createdAt,
                updatedAt: fullUserData.updatedAt,
            },
            message: 'User profile retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserProfile = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'] || req.query.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await repo.getUserByClerkId(clerkUserId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = await repo.updateUser(user.id, req.validatedData);

        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            data: {
                id: updatedUser.id,
                clerkUserId: updatedUser.clerkUserId,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                avatarUrl: updatedUser.avatarUrl,
                updatedAt: updatedUser.updatedAt,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'] || req.query.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await repo.getUserByClerkId(clerkUserId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await repo.deleteUser(user.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        // Since Clerk handles authentication, this endpoint mainly validates
        // the user exists in our database and returns user data
        const clerkUserId = req.headers['x-clerk-user-id'] || req.body.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        let user = await repo.getUserByClerkId(clerkUserId);
        
        // If user doesn't exist in our DB, create them
        if (!user) {
            const { email, displayName, avatarUrl } = req.body;
            user = await repo.createUser({
                clerkUserId,
                email,
                displayName,
                avatarUrl,
            });
            
            // Create default preferences
            await repo.createDefaultPreferences(user.id);
        }

        // Get full user data with preferences
        const fullUserData = await repo.getUserWithPreferences(user.id);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                id: fullUserData.id,
                clerkUserId: fullUserData.clerkUserId,
                email: fullUserData.email,
                displayName: fullUserData.displayName,
                avatarUrl: fullUserData.avatarUrl,
                preferences: fullUserData.preferences,
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        // Since Clerk handles authentication, logout is mainly handled on the frontend
        // This endpoint can be used for any server-side cleanup if needed
        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        // Clerk handles token refresh, so this is mainly a placeholder
        // In a real implementation, you might validate the refresh token with Clerk
        res.status(200).json({
            success: true,
            message: 'Token refresh handled by Clerk'
        });
    } catch (error) {
        next(error);
    }
};

// Clerk webhook handler for user events
export const handleClerkWebhook = async (req, res, next) => {
    try {
        const { type, data } = req.validatedData;

        switch (type) {
            case 'user.created':
                await handleUserCreated(data);
                break;
            case 'user.updated':
                await handleUserUpdated(data);
                break;
            case 'user.deleted':
                await handleUserDeleted(data);
                break;
            default:
                console.log(`Unhandled webhook type: ${type}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

// Helper functions for webhook handlers
const handleUserCreated = async (userData) => {
    const primaryEmail = userData.email_addresses?.find(email => email.id === userData.primary_email_address_id);
    
    if (primaryEmail) {
        await repo.createUser({
            clerkUserId: userData.id,
            email: primaryEmail.email_address,
            displayName: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : null,
            avatarUrl: userData.profile_image_url || userData.image_url,
        });
    }
};

const handleUserUpdated = async (userData) => {
    const user = await repo.getUserByClerkId(userData.id);
    if (user) {
        const primaryEmail = userData.email_addresses?.find(email => email.id === userData.primary_email_address_id);
        
        await repo.updateUser(user.id, {
            email: primaryEmail?.email_address || user.email,
            displayName: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : user.displayName,
            avatarUrl: userData.profile_image_url || userData.image_url || user.avatarUrl,
        });
    }
};

const handleUserDeleted = async (userData) => {
    const user = await repo.getUserByClerkId(userData.id);
    if (user) {
        await repo.deleteUser(user.id);
    }
};