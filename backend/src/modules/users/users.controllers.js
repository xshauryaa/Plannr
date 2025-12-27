import * as repo from './users.repo.js';

/**
 * User Controllers
 * Handles user-related HTTP requests
 */

export const createUser = async (req, res, next) => {
    try {
        const { clerkUserId, email, displayName, avatarName } = req.validatedData;

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
            avatarName,
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
                avatarName: newUser.avatarName,
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
                avatarName: fullUserData.avatarName,
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
                avatarName: updatedUser.avatarName,
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
            const { email, displayName, avatarName } = req.body;
            user = await repo.createUser({
                clerkUserId,
                email,
                displayName,
                avatarName,
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
                avatarName: fullUserData.avatarName,
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
        console.log('🔗 Clerk webhook received:', req.body);
        
        const { type, data } = req.validatedData;
        console.log(`📨 Webhook type: ${type}`);

        switch (type) {
            case 'user.created':
                console.log('👤 Handling user creation...');
                await handleUserCreated(data);
                break;
            case 'user.updated':
                console.log('✏️ Handling user update...');
                await handleUserUpdated(data);
                break;
            case 'user.deleted':
                console.log('🗑️ Handling user deletion...');
                await handleUserDeleted(data);
                break;
            default:
                console.log(`⚠️ Unhandled webhook type: ${type}`);
        }

        console.log('✅ Webhook processed successfully');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        next(error);
    }
};

// Manual sync function for testing
export const syncUserFromClerk = async (req, res, next) => {
    try {
        const { clerkUserId, email, displayName, avatarName } = req.body;
        
        if (!clerkUserId) {
            return res.status(400).json({
                success: false,
                message: 'clerkUserId is required'
            });
        }

        // Check if user already exists
        const existingUser = await repo.getUserByClerkId(clerkUserId);
        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'User already exists',
                data: { userId: existingUser.id }
            });
        }

        // If minimal data provided, create user with basic info
        // The webhook will update with full details later
        const userData = {
            clerkUserId,
            email: email || `user-${clerkUserId}@temp.com`,
            displayName: displayName || null,
            avatarName: avatarName || 'puppy', // Default to puppy avatar
        };

        console.log('Creating user with data:', userData);

        // Create new user
        const newUser = await repo.createUser(userData);

        // Create default preferences
        await repo.createDefaultPreferences(newUser.id);

        res.status(201).json({
            success: true,
            message: 'User synced successfully',
            data: {
                userId: newUser.id,
                clerkUserId: newUser.clerkUserId,
                email: newUser.email,
                displayName: newUser.displayName,
                avatarName: newUser.avatarName,
                createdAt: newUser.createdAt,
            }
        });
    } catch (error) {
        console.error('Sync user error:', error);
        next(error);
    }
};

// Helper functions for webhook handlers
const getRandomAvatar = () => {
    const avatars = ['bear', 'bunny', 'cat', 'croc', 'fox', 'hen', 'lion', 'puppy', 'squirrel'];
    return avatars[Math.floor(Math.random() * avatars.length)];
};

const handleUserCreated = async (userData) => {
    console.log('📋 User data received:', userData);
    
    const primaryEmail = userData.email_addresses?.find(email => email.id === userData.primary_email_address_id);
    
    if (!primaryEmail) {
        console.error('❌ No primary email found for user:', userData.id);
        throw new Error('No primary email address found');
    }

    console.log(`📧 Creating user with email: ${primaryEmail.email_address}`);
    
    try {
        const newUser = await repo.createUser({
            clerkUserId: userData.id,
            email: primaryEmail.email_address,
            displayName: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : null,
            avatarName: getRandomAvatar(), // Assign random avatar instead of using profile image
        });
        
        // Create default preferences
        await repo.createDefaultPreferences(newUser.id);
        
        console.log(`✅ User created successfully: ${newUser.id}`);
    } catch (error) {
        console.error('❌ Error creating user:', error);
        throw error;
    }
};

const handleUserUpdated = async (userData) => {
    const user = await repo.getUserByClerkId(userData.id);
    if (user) {
        const primaryEmail = userData.email_addresses?.find(email => email.id === userData.primary_email_address_id);
        
        await repo.updateUser(user.id, {
            email: primaryEmail?.email_address || user.email,
            displayName: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : user.displayName,
            // Keep existing avatar name, don't change it on updates
        });
    }
};

const handleUserDeleted = async (userData) => {
    const user = await repo.getUserByClerkId(userData.id);
    if (user) {
        await repo.deleteUser(user.id);
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'];
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { avatarName } = req.validatedData;

        if (!avatarName) {
            return res.status(400).json({
                success: false,
                message: 'Avatar name is required'
            });
        }

        // Validate avatar name
        const validAvatars = ['bear', 'bunny', 'cat', 'croc', 'fox', 'hen', 'lion', 'puppy', 'squirrel'];
        if (!validAvatars.includes(avatarName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid avatar name'
            });
        }

        // Get user from database
        const user = await repo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user's avatar name in database
        const updatedUser = await repo.updateUser(user.id, {
            avatarName: avatarName
        });

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: {
                avatarName: avatarName,
                user: {
                    id: updatedUser.id,
                    clerkUserId: updatedUser.clerkUserId,
                    avatarName: updatedUser.avatarName
                }
            }
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        next(error);
    }
};