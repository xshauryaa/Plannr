import { useAuth, useUser } from '@clerk/clerk-expo';

/**
 * API utility for making authenticated requests to your backend
 * Use this to call your backend APIs with Clerk authentication
 */
export const useAuthenticatedAPI = () => {
    const { getToken, userId } = useAuth();
    const { user } = useUser();

    const makeAuthenticatedRequest = async (endpoint, options = {}) => {
        try {
            // Get the current session token from Clerk
            const token = await getToken();
            
            if (!token) {
                throw new Error('No authentication token available');
            }

            // Make the API request with the token
            const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001';
            const response = await fetch(`${apiBaseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-clerk-user-id': userId, // Use userId from auth hook instead
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Error Response:', errorData);
                throw new Error(`API request failed: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    };

    // Enhanced sync function that gets user data from Clerk
    const syncUserToBackend = async () => {
        try {
            console.log('=== Starting syncUserToBackend ===');
            console.log('API Base URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
            
            // Get the token first, which should be available after authentication
            const token = await getToken();
            
            if (!token) {
                throw new Error('No authentication token available');
            }

            // Extract user ID from the token payload
            let userIdFromToken = null;
            let userEmail = null;
            try {
                // Decode JWT to get user data (basic decode, not verification)
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                userIdFromToken = payload.sub || payload.user_id || payload.id;
                userEmail = payload.email;
                console.log('Extracted from token - User ID:', userIdFromToken, 'Email:', userEmail);
            } catch (decodeError) {
                console.error('Failed to decode token:', decodeError);
            }

            // Use token user ID or fallback to hook user ID
            let currentUserId = userIdFromToken || userId;
            
            if (!currentUserId) {
                console.log('No user ID available from token or auth hook');
                throw new Error('No user ID available after authentication');
            }

            console.log('Syncing user with ID:', currentUserId);

            // Get additional user data if available from auth context
            let userData = {
                clerkUserId: currentUserId,
            };

            // Add email if we have it
            if (userEmail) {
                userData.email = userEmail;
            }

            // Try to get more user data from the auth hook if available
            if (user) {
                console.log('Adding user data from auth context');
                if (user.emailAddresses?.[0]?.emailAddress) {
                    userData.email = user.emailAddresses[0].emailAddress;
                }
                if (user.firstName || user.lastName) {
                    userData.displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                }
                if (user.imageUrl) {
                    userData.avatarUrl = user.imageUrl;
                }
            }

            console.log('Syncing user data:', userData);

            // Send user data to backend
            return makeAuthenticatedRequest('/api/users/sync', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
        } catch (error) {
            console.error('Sync user error:', error);
            throw error;
        }
    };

    return {
        // Manual sync function
        syncUserToBackend,
        
        // User profile operations
        getUserProfile: () => makeAuthenticatedRequest('/api/users/profile'),
        updateUserProfile: (data) => makeAuthenticatedRequest('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteUserAccount: () => makeAuthenticatedRequest('/api/users/account', {
            method: 'DELETE',
        }),
        
        // Schedules operations  
        getSchedules: () => makeAuthenticatedRequest('/api/schedules'),
        createSchedule: (data) => makeAuthenticatedRequest('/api/schedules', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        
        // Preferences operations
        getPreferences: () => makeAuthenticatedRequest('/api/preferences'),
        updatePreferences: (data) => makeAuthenticatedRequest('/api/preferences', {
            method: 'PUT', 
            body: JSON.stringify(data),
        }),
    };
};
