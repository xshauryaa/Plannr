import * as repo from './integrations.repo.js';
import { clerkClient } from '../../config/clerk.js';
import axios from 'axios';

/**
 * Integration Controllers
 * Handles integration-related HTTP requests
 */

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const REQUIRED_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

/**
 * Get Google OAuth access token from Clerk
 * @param {string} userId - Clerk user ID
 * @returns {Promise<string>} Access token
 * @throws {Error} If token is not available or missing required scope
 */
const getGoogleAccessToken = async (userId) => {
    try {
        const oauthTokens = await clerkClient.users.getUserOauthAccessToken(userId, 'google');
        
        if (!oauthTokens || oauthTokens.length === 0) {
            throw new Error('GOOGLE_CALENDAR_NOT_CONNECTED');
        }

        const tokenData = oauthTokens[0];
        
        // Check if the required scope is present
        if (!tokenData.scopes || !tokenData.scopes.includes(REQUIRED_SCOPE)) {
            throw new Error('GOOGLE_CALENDAR_NOT_CONNECTED');
        }

        return tokenData.token;
    } catch (error) {
        if (error.message === 'GOOGLE_CALENDAR_NOT_CONNECTED') {
            throw error;
        }
        console.error('Error fetching Google OAuth token:', error);
        throw new Error('GOOGLE_CALENDAR_NOT_CONNECTED');
    }
};

/**
 * Find or create the Plannr calendar
 * @param {string} accessToken - Google OAuth access token
 * @param {string} timeZone - User's timezone
 * @returns {Promise<string>} Calendar ID
 */
const findOrCreatePlannrCalendar = async (accessToken, timeZone = 'UTC') => {
    try {
        // First, check if Plannr calendar already exists
        const calendarListResponse = await axios.get(`${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Look for existing Plannr calendar
        const plannrCalendar = calendarListResponse.data.items?.find(
            calendar => calendar.summary === 'Plannr'
        );

        if (plannrCalendar) {
            return plannrCalendar.id;
        }

        // Create new Plannr calendar if not found
        const createCalendarResponse = await axios.post(`${GOOGLE_CALENDAR_API_BASE}/calendars`, {
            summary: 'Plannr',
            timeZone: timeZone,
            description: 'Events added by Plannr'
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return createCalendarResponse.data.id;
    } catch (error) {
        console.error('Error finding/creating Plannr calendar:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('GOOGLE_CALENDAR_REAUTH_REQUIRED');
        }
        throw new Error('Failed to setup Plannr calendar');
    }
};

/**
 * Insert event into Google Calendar
 * @param {string} accessToken - Google OAuth access token
 * @param {string} calendarId - Google Calendar ID
 * @param {Object} event - Event data
 * @returns {Promise<string>} Google event ID
 */
const insertGoogleCalendarEvent = async (accessToken, calendarId, event) => {
    try {
        const eventData = {
            summary: event.title,
            description: event.description || '',
            start: {
                dateTime: event.start,
                ...(event.timeZone && { timeZone: event.timeZone })
            },
            end: {
                dateTime: event.end,
                ...(event.timeZone && { timeZone: event.timeZone })
            },
            source: {
                title: 'Plannr',
                url: `plannr://event/${event.uid}`
            },
            extendedProperties: {
                private: {
                    plannrUid: event.uid
                }
            }
        };

        const response = await axios.post(
            `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events`,
            eventData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.id;
    } catch (error) {
        console.error('Error inserting Google Calendar event:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('GOOGLE_CALENDAR_REAUTH_REQUIRED');
        }
        throw new Error(`Failed to insert event: ${event.title}`);
    }
};

/**
 * Export events to Google Calendar
 */
export const exportToGoogleCalendar = async (req, res, next) => {
    try {
        const { events } = req.validatedData;
        const userId = req.headers['x-clerk-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Get Google access token
        let accessToken;
        try {
            accessToken = await getGoogleAccessToken(userId);
        } catch (error) {
            if (error.message === 'GOOGLE_CALENDAR_NOT_CONNECTED') {
                return res.status(409).json({
                    success: false,
                    error: 'GOOGLE_CALENDAR_NOT_CONNECTED',
                    message: 'Google Calendar is not connected or missing required permissions'
                });
            }
            throw error;
        }

        // Check cache for calendar ID first
        let calendarId = await repo.getCachedGoogleCalendarId(userId);
        
        if (!calendarId) {
            // Determine timezone from first event or default to UTC
            const timeZone = events[0]?.timeZone || 'UTC';
            
            // Find or create Plannr calendar
            calendarId = await findOrCreatePlannrCalendar(accessToken, timeZone);
            
            // Cache the calendar ID
            await repo.cacheGoogleCalendarId(userId, calendarId);
        }

        // Insert all events
        const insertResults = [];
        let insertedCount = 0;

        for (const event of events) {
            try {
                const googleEventId = await insertGoogleCalendarEvent(accessToken, calendarId, event);
                insertResults.push({
                    uid: event.uid,
                    eventId: googleEventId
                });
                insertedCount++;
            } catch (error) {
                console.error(`Failed to insert event ${event.uid}:`, error.message);
                // Continue with other events even if one fails
            }
        }

        res.status(200).json({
            success: true,
            data: {
                inserted: insertedCount,
                calendarId: calendarId,
                googleEventIds: insertResults
            }
        });

    } catch (error) {
        console.error('Google Calendar export error:', error);
        
        if (error.message === 'GOOGLE_CALENDAR_REAUTH_REQUIRED') {
            return res.status(409).json({
                success: false,
                error: 'GOOGLE_CALENDAR_REAUTH_REQUIRED',
                message: 'Google Calendar requires re-authentication'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to export events to Google Calendar'
        });
    }
};

/**
 * Get Google Calendar connection status
 */
export const getGoogleCalendarStatus = async (req, res, next) => {
    try {
        const userId = req.headers['x-clerk-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Attempt to get Google access token
        try {
            await getGoogleAccessToken(userId);
            
            res.status(200).json({
                success: true,
                data: {
                    connected: true
                }
            });
        } catch (error) {
            res.status(200).json({
                success: true,
                data: {
                    connected: false
                }
            });
        }

    } catch (error) {
        console.error('Google Calendar status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check Google Calendar status'
        });
    }
};
