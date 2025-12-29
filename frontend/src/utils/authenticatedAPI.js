import { useAuth, useUser } from '@clerk/clerk-expo';
import { serializeSchedule, parseSchedule } from '../persistence/ScheduleHandler';
import { serializeTimeBlock, parseTimeBlock } from '../persistence/TimeBlockHandler';

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
                // Avatar will be assigned randomly by backend, no longer using Clerk imageUrl
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
        // Direct access to the authenticated request function
        makeAuthenticatedRequest,
        
        // Manual sync function
        syncUserToBackend,
        
        // User profile operations
        getUserProfile: () => makeAuthenticatedRequest('/api/users/profile'),
        updateUserProfile: (data) => makeAuthenticatedRequest('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        updateAvatar: (avatarName) => makeAuthenticatedRequest('/api/users/avatar', {
            method: 'PUT',
            body: JSON.stringify({ avatarName }),
        }),
        markOnboardingComplete: () => makeAuthenticatedRequest('/api/users/onboarding/complete', {
            method: 'POST',
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
        getScheduleById: (id, includeBlocks = false) => makeAuthenticatedRequest(`/api/schedules/${id}?includeBlocks=${includeBlocks}`),
        updateSchedule: (id, data) => makeAuthenticatedRequest(`/api/schedules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteSchedule: (id) => makeAuthenticatedRequest(`/api/schedules/${id}`, {
            method: 'DELETE',
        }),
        
        // Blocks operations
        addBlocksToSchedule: (scheduleId, blocks) => makeAuthenticatedRequest(`/api/schedules/${scheduleId}/blocks`, {
            method: 'POST',
            body: JSON.stringify({ blocks }),
        }),
        updateBlock: (scheduleId, blockId, data) => makeAuthenticatedRequest(`/api/schedules/${scheduleId}/blocks/${blockId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        deleteBlock: (scheduleId, blockId) => makeAuthenticatedRequest(`/api/schedules/${scheduleId}/blocks/${blockId}`, {
            method: 'DELETE',
        }),
        markBlockComplete: (scheduleId, blockId, completed = true) => makeAuthenticatedRequest(`/api/schedules/${scheduleId}/blocks/${blockId}/complete`, {
            method: 'POST',
            body: JSON.stringify({ completed }),
        }),
        
        // Preferences operations
        getPreferences: () => makeAuthenticatedRequest('/api/preferences'),
        updatePreferences: (data) => makeAuthenticatedRequest('/api/preferences', {
            method: 'PUT', 
            body: JSON.stringify(data),
        }),

        // Schedule/TimeBlock conversion helpers
        convertScheduleToBackendJSON: (scheduleObject) => {
            if (!scheduleObject) return null;
            
            // Use existing serialization handler
            const serialized = serializeSchedule(scheduleObject);
            
            if (!serialized) return null;

            // Transform to backend format matching the schedules table schema
            return {
                title: `Schedule ${new Date().toISOString().split('T')[0]}`, // Default title, can be overridden
                numDays: serialized.numDays,
                day1Date: serialized.day1Date, // JSONB field stores ScheduleDate object
                day1Day: serialized.day1Day,
                minGap: serialized.minGap,
                workingHoursLimit: serialized.workingHoursLimit,
                strategy: serialized.strategy,
                startTime: serialized.startTime || 900, // Already an integer from serializeTime24
                endTime: serialized.endTime || 1700, // Already an integer from serializeTime24
                metadata: {
                    eventDependencies: serialized.eventDependencies,
                    fullScheduleData: serialized.schedule, // Store complete schedule map
                    serializedAt: new Date().toISOString()
                }
            };
        },

        convertTimeBlockToBackendJSON: (timeBlockObject) => {
            if (!timeBlockObject) return null;
            
            // Use existing serialization handler  
            const serialized = serializeTimeBlock(timeBlockObject);
            
            if (!serialized) return null;

            // Transform to backend format matching the blocks table schema
            return {
                type: serialized.type, // 'rigid' | 'flexible' | 'break'
                title: serialized.name,
                startAt: serialized.startTime || 0, // Already an integer from serializeTime24
                endAt: serialized.endTime || 0, // Already an integer from serializeTime24
                blockDate: serialized.date ? `${serialized.date.year}-${String(serialized.date.month).padStart(2, '0')}-${String(serialized.date.date).padStart(2, '0')}` : null,
                dateObject: serialized.date, // JSONB field stores ScheduleDate object
                category: serialized.activityType,
                priority: serialized.priority,
                deadline: serialized.deadline ? `${serialized.deadline.year}-${String(serialized.deadline.month).padStart(2, '0')}-${String(serialized.deadline.date).padStart(2, '0')}` : null,
                deadlineObject: serialized.deadline, // JSONB field stores ScheduleDate object
                duration: serialized.duration,
                completed: serialized.completed || false,
                metadata: {
                    originalSerialized: serialized, // Keep full serialized data for reconstruction
                    convertedAt: new Date().toISOString()
                }
            };
        },

        // Complete app state loading helper with exact AppState mapping
        loadCompleteAppState: async () => {
            try {
                const [userProfileResponse, preferencesResponse, schedulesResponse] = await Promise.all([
                    makeAuthenticatedRequest('/api/users/profile'),
                    makeAuthenticatedRequest('/api/preferences'),
                    makeAuthenticatedRequest('/api/schedules')
                ]);

                // Extract data from API responses (handle both direct data and wrapped responses)
                const userProfile = userProfileResponse?.data || userProfileResponse;
                const preferences = preferencesResponse?.data || preferencesResponse;
                const schedules = schedulesResponse?.data || schedulesResponse || [];

                console.log('API Response Debug:', {
                    userProfileType: typeof userProfile,
                    preferencesType: typeof preferences,
                    schedulesType: typeof schedules,
                    schedulesIsArray: Array.isArray(schedules),
                    userProfile,
                    preferences,
                    schedules
                });

                // Ensure schedules is an array
                const schedulesArray = Array.isArray(schedules) ? schedules : [];

                // Transform to exact AppState format with proper key-value mapping
                const appStateData = {
                    // User profile mapping
                    name: userProfile?.displayName || '',
                    avatarName: userProfile?.avatarName || 'cat',
                    onboarded: Boolean(userProfile?.onboarded), // Ensure boolean type
                    firstLaunch: false, // Set to false since user exists in DB
                    
                    // Preferences mapping - exact key matching with type conversion
                    userPreferences: {
                        theme: preferences?.uiMode === 'dark' ? 'dark' : 'light', // uiMode -> theme
                        defaultStrategy: preferences?.defaultStrategy || 'earliest-fit', // direct mapping
                        defaultMinGap: String(preferences?.minGapMinutes || 15), // integer -> string
                        defaultMaxWorkingHours: String(preferences?.maxWorkHoursPerDay || 8), // integer -> string  
                        taskRemindersEnabled: Boolean(preferences?.notificationsEnabled ?? true), // ensure boolean
                        leadMinutes: String(preferences?.leadMinutes || 30), // integer -> string
                    },
                    
                    // Schedules mapping with proper structure
                    savedSchedules: schedulesArray.map(schedule => ({
                        name: schedule.title, // title -> name
                        backendId: schedule.id,
                        schedule: null, // Will be populated by separate helper
                        isActive: Boolean(schedule.isActive || false) // ensure boolean
                    })),
                    
                    // Active schedule mapping
                    activeSchedule: schedulesArray.find(s => s.isActive) ? (() => {
                        const activeSchedule = schedulesArray.find(s => s.isActive);
                        return {
                            name: activeSchedule.title, // title -> name
                            backendId: activeSchedule.id,
                            schedule: null, // Will be populated by separate helper
                            isActive: true
                        };
                    })() : null
                };

                console.log('✅ Successfully transformed app state:', appStateData);
                return appStateData;
            } catch (error) {
                console.error('Failed to load complete app state from database:', error);
                throw error;
            }
        },

        // Schedule reconstruction from database with parsers
        loadScheduleFromDatabase: async (scheduleId) => {
            try {
                // Get schedule with blocks from database
                const scheduleData = await makeAuthenticatedRequest(`/api/schedules/${scheduleId}?includeBlocks=true`);
                
                if (!scheduleData.success || !scheduleData.data) {
                    throw new Error('Failed to fetch schedule data from database');
                }

                const { schedule, blocks } = scheduleData.data;

                // Convert database format to serialized format expected by parseSchedule
                const serializedSchedule = {
                    numDays: schedule.numDays,
                    day1Date: schedule.day1Date, // Already in ScheduleDate format from JSONB
                    day1Day: schedule.day1Day,
                    minGap: schedule.minGap,
                    workingHoursLimit: schedule.workingHoursLimit,
                    strategy: schedule.strategy,
                    startTime: { hour: Math.floor(schedule.startTime / 100), minute: schedule.startTime % 100 }, // Convert integer to Time24 format
                    endTime: { hour: Math.floor(schedule.endTime / 100), minute: schedule.endTime % 100 },
                    eventDependencies: schedule.metadata?.eventDependencies || { dependencies: [] },
                    schedule: [] // We'll build this from blocks
                };

                // Group blocks by date to reconstruct the schedule map
                const blocksByDate = {};
                blocks.forEach(block => {
                    const dateKey = block.blockDate;
                    if (!blocksByDate[dateKey]) {
                        blocksByDate[dateKey] = [];
                    }
                    
                    // Convert database block to serialized TimeBlock format
                    const serializedBlock = {
                        name: block.title,
                        date: block.dateObject || { 
                            date: parseInt(block.blockDate.split('-')[2]),
                            month: parseInt(block.blockDate.split('-')[1]),
                            year: parseInt(block.blockDate.split('-')[0])
                        },
                        activityType: block.category,
                        priority: block.priority,
                        startTime: { hour: Math.floor(block.startAt / 100), minute: block.startAt % 100 },
                        endTime: { hour: Math.floor(block.endAt / 100), minute: block.endAt % 100 },
                        duration: block.duration,
                        completed: block.completed,
                        deadline: block.deadlineObject || block.deadline ? { 
                            date: parseInt(block.deadline?.split('-')[2] || 1),
                            month: parseInt(block.deadline?.split('-')[1] || 1),
                            year: parseInt(block.deadline?.split('-')[0] || 2025)
                        } : null,
                        type: block.type
                    };

                    blocksByDate[dateKey].push(serializedBlock);
                });

                // Convert blocks map to the format expected by parseSchedule
                serializedSchedule.schedule = Object.entries(blocksByDate).map(([dateKey, blocks]) => [
                    dateKey,
                    { timeBlocks: blocks } // DaySchedule format expected by parseDaySchedule
                ]);

                // Use existing parseSchedule handler to reconstruct Schedule object
                const reconstructedSchedule = parseSchedule(serializedSchedule);
                
                if (!reconstructedSchedule) {
                    throw new Error('Failed to parse reconstructed schedule');
                }

                console.log('✅ Successfully reconstructed Schedule object from database');
                return reconstructedSchedule;

            } catch (error) {
                console.error('Failed to load and reconstruct schedule from database:', error);
                throw error;
            }
        },

        // Load complete app state with reconstructed Schedule objects
        loadCompleteAppStateWithSchedules: async () => {
            try {
                // First load basic app state using the helper defined above
                const basicAppState = await (() => {
                    // Inline call to loadCompleteAppState logic
                    return makeAuthenticatedRequest('/api/users/profile')
                        .then(async (userProfile) => {
                            const [preferences, schedules] = await Promise.all([
                                makeAuthenticatedRequest('/api/preferences'),
                                makeAuthenticatedRequest('/api/schedules')
                            ]);
                            
                            return {
                                name: userProfile.displayName || '',
                                avatarName: userProfile.avatarName || 'cat',
                                onboarded: Boolean(userProfile.onboarded),
                                firstLaunch: false,
                                userPreferences: {
                                    theme: preferences.uiMode === 'dark' ? 'dark' : 'light',
                                    defaultStrategy: preferences.defaultStrategy || 'earliest-fit',
                                    defaultMinGap: String(preferences.minGapMinutes || 15),
                                    defaultMaxWorkingHours: String(preferences.maxWorkHoursPerDay || 8),
                                    taskRemindersEnabled: Boolean(preferences.notificationsEnabled ?? true),
                                    leadMinutes: String(preferences.leadMinutes || 30),
                                },
                                savedSchedules: schedules.map(schedule => ({
                                    name: schedule.title,
                                    backendId: schedule.id,
                                    schedule: null,
                                    isActive: Boolean(schedule.isActive || false)
                                })),
                                activeSchedule: schedules.find(s => s.isActive) ? (() => {
                                    const activeSchedule = schedules.find(s => s.isActive);
                                    return {
                                        name: activeSchedule.title,
                                        backendId: activeSchedule.id,
                                        schedule: null,
                                        isActive: true
                                    };
                                })() : null
                            };
                        });
                })();
                
                // Create a reference to the loadScheduleFromDatabase function
                const loadScheduleFromDatabase = async (scheduleId) => {
                    const scheduleData = await makeAuthenticatedRequest(`/api/schedules/${scheduleId}?includeBlocks=true`);
                    
                    if (!scheduleData.success || !scheduleData.data) {
                        throw new Error('Failed to fetch schedule data from database');
                    }

                    const { schedule, blocks } = scheduleData.data;

                    const serializedSchedule = {
                        numDays: schedule.numDays,
                        day1Date: schedule.day1Date,
                        day1Day: schedule.day1Day,
                        minGap: schedule.minGap,
                        workingHoursLimit: schedule.workingHoursLimit,
                        strategy: schedule.strategy,
                        startTime: { hour: Math.floor(schedule.startTime / 100), minute: schedule.startTime % 100 },
                        endTime: { hour: Math.floor(schedule.endTime / 100), minute: schedule.endTime % 100 },
                        eventDependencies: schedule.metadata?.eventDependencies || { dependencies: [] },
                        schedule: []
                    };

                    const blocksByDate = {};
                    blocks.forEach(block => {
                        const dateKey = block.blockDate;
                        if (!blocksByDate[dateKey]) {
                            blocksByDate[dateKey] = [];
                        }
                        
                        blocksByDate[dateKey].push({
                            name: block.title,
                            date: block.dateObject || { 
                                date: parseInt(block.blockDate.split('-')[2]),
                                month: parseInt(block.blockDate.split('-')[1]),
                                year: parseInt(block.blockDate.split('-')[0])
                            },
                            activityType: block.category,
                            priority: block.priority,
                            startTime: { hour: Math.floor(block.startAt / 100), minute: block.startAt % 100 },
                            endTime: { hour: Math.floor(block.endAt / 100), minute: block.endAt % 100 },
                            duration: block.duration,
                            completed: block.completed,
                            deadline: block.deadlineObject || block.deadline ? { 
                                date: parseInt(block.deadline?.split('-')[2] || 1),
                                month: parseInt(block.deadline?.split('-')[1] || 1),
                                year: parseInt(block.deadline?.split('-')[0] || 2025)
                            } : null,
                            type: block.type
                        });
                    });

                    serializedSchedule.schedule = Object.entries(blocksByDate).map(([dateKey, blocks]) => [
                        dateKey,
                        { timeBlocks: blocks }
                    ]);

                    return parseSchedule(serializedSchedule);
                };
                
                // Then load Schedule objects for saved schedules (parallel loading)
                const schedulePromises = basicAppState.savedSchedules
                    .filter(s => s.backendId)
                    .map(async (savedSchedule) => {
                        try {
                            const scheduleObject = await loadScheduleFromDatabase(savedSchedule.backendId);
                            return {
                                ...savedSchedule,
                                schedule: scheduleObject
                            };
                        } catch (error) {
                            console.warn(`Failed to load schedule ${savedSchedule.name}:`, error);
                            return savedSchedule;
                        }
                    });

                const reconstructedSchedules = await Promise.all(schedulePromises);

                const completeAppState = {
                    ...basicAppState,
                    savedSchedules: reconstructedSchedules,
                    activeSchedule: reconstructedSchedules.find(s => s.isActive) || null
                };

                console.log('✅ Loaded complete app state with reconstructed Schedule objects');
                return completeAppState;

            } catch (error) {
                console.error('Failed to load complete app state with schedules:', error);
                throw error;
            }
        },

        // Standalone helper to load a single Schedule object by ID
        loadScheduleObjectById: async (scheduleId) => {
            try {
                const scheduleData = await makeAuthenticatedRequest(`/api/schedules/${scheduleId}?includeBlocks=true`);
                
                if (!scheduleData.success || !scheduleData.data) {
                    throw new Error('Failed to fetch schedule data from database');
                }

                const { schedule, blocks } = scheduleData.data;

                const serializedSchedule = {
                    numDays: schedule.numDays,
                    day1Date: schedule.day1Date,
                    day1Day: schedule.day1Day,
                    minGap: schedule.minGap,
                    workingHoursLimit: schedule.workingHoursLimit,
                    strategy: schedule.strategy,
                    startTime: { hour: Math.floor(schedule.startTime / 100), minute: schedule.startTime % 100 },
                    endTime: { hour: Math.floor(schedule.endTime / 100), minute: schedule.endTime % 100 },
                    eventDependencies: schedule.metadata?.eventDependencies || { dependencies: [] },
                    schedule: []
                };

                const blocksByDate = {};
                blocks.forEach(block => {
                    const dateKey = block.blockDate;
                    if (!blocksByDate[dateKey]) {
                        blocksByDate[dateKey] = [];
                    }
                    
                    blocksByDate[dateKey].push({
                        name: block.title,
                        date: block.dateObject || { 
                            date: parseInt(block.blockDate.split('-')[2]),
                            month: parseInt(block.blockDate.split('-')[1]),
                            year: parseInt(block.blockDate.split('-')[0])
                        },
                        activityType: block.category,
                        priority: block.priority,
                        startTime: { hour: Math.floor(block.startAt / 100), minute: block.startAt % 100 },
                        endTime: { hour: Math.floor(block.endAt / 100), minute: block.endAt % 100 },
                        duration: block.duration,
                        completed: block.completed,
                        deadline: block.deadlineObject || block.deadline ? { 
                            date: parseInt(block.deadline?.split('-')[2] || 1),
                            month: parseInt(block.deadline?.split('-')[1] || 1),
                            year: parseInt(block.deadline?.split('-')[0] || 2025)
                        } : null,
                        type: block.type
                    });
                });

                serializedSchedule.schedule = Object.entries(blocksByDate).map(([dateKey, blocks]) => [
                    dateKey,
                    { timeBlocks: blocks }
                ]);

                const reconstructedSchedule = parseSchedule(serializedSchedule);
                
                if (!reconstructedSchedule) {
                    throw new Error('Failed to parse reconstructed schedule');
                }

                console.log(`✅ Successfully loaded Schedule object for ID: ${scheduleId}`);
                return reconstructedSchedule;

            } catch (error) {
                console.error(`Failed to load Schedule object for ID ${scheduleId}:`, error);
                throw error;
            }
        },
    };
};
