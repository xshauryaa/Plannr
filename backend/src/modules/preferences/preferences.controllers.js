import * as repo from './preferences.repo.js';
import * as userRepo from '../users/users.repo.js';
import { mapFrontendToBackend, mapBackendToFrontend } from './preferences.validators.js';

/**
 * Preferences Controllers
 * Handles user preferences HTTP requests
 */

export const getPreferences = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'] || req.query.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userPreferences = await repo.getPreferencesByClerkId(clerkUserId);
        
        if (!userPreferences) {
            // If no preferences exist, create default ones
            const user = await userRepo.getUserByClerkId(clerkUserId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const defaultPreferences = await repo.createPreferences(user.id);
            const frontendPrefs = mapBackendToFrontend(defaultPreferences);
            
            return res.status(200).json({
                success: true,
                data: frontendPrefs,
                message: 'Default preferences created and retrieved successfully'
            });
        }

        // Convert backend format to frontend format
        const frontendPrefs = mapBackendToFrontend(userPreferences);

        res.status(200).json({
            success: true,
            data: frontendPrefs,
            message: 'Preferences retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updatePreferences = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'] || req.query.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Convert frontend preferences to backend format
        const backendPrefs = mapFrontendToBackend(req.validatedData);

        // Check if preferences exist
        let userPreferences = await repo.getPreferencesByUserId(user.id);
        
        if (!userPreferences) {
            // Create new preferences if they don't exist
            userPreferences = await repo.createPreferences(user.id, req.validatedData);
        } else {
            // Update existing preferences
            userPreferences = await repo.updatePreferences(user.id, backendPrefs);
        }

        // Convert back to frontend format for response
        const frontendPrefs = mapBackendToFrontend(userPreferences);

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: frontendPrefs
        });
    } catch (error) {
        next(error);
    }
};

export const resetPreferences = async (req, res, next) => {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'] || req.query.clerkUserId;
        
        if (!clerkUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await userRepo.getUserByClerkId(clerkUserId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if preferences exist
        const existingPrefs = await repo.getPreferencesByUserId(user.id);
        
        let resetPreferences;
        if (!existingPrefs) {
            // Create default preferences if they don't exist
            resetPreferences = await repo.createPreferences(user.id);
        } else {
            // Reset existing preferences
            resetPreferences = await repo.resetPreferences(user.id);
        }

        // Convert to frontend format
        const frontendPrefs = mapBackendToFrontend(resetPreferences);

        res.status(200).json({
            success: true,
            message: 'Preferences reset successfully',
            data: frontendPrefs
        });
    } catch (error) {
        next(error);
    }
};