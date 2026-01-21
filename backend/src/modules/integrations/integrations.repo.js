/**
 * Integration Repository
 * Handles database operations for integrations
 */

// For now, we'll use an in-memory cache for Google Calendar IDs
// In a production environment, you might want to store this in the database
const googleCalendarCache = new Map();

/**
 * Cache Google Calendar ID for a user
 * @param {string} userId - Clerk user ID
 * @param {string} calendarId - Google Calendar ID
 * @param {string} calendarName - Calendar name (optional, defaults to 'Plannr')
 */
export const cacheGoogleCalendarId = async (userId, calendarId, calendarName = 'Plannr') => {
    const cacheKey = `${userId}:${calendarName}`;
    googleCalendarCache.set(cacheKey, calendarId);
    return calendarId;
};

/**
 * Get cached Google Calendar ID for a user
 * @param {string} userId - Clerk user ID
 * @param {string} calendarName - Calendar name (optional, defaults to 'Plannr')
 * @returns {string|null} Calendar ID or null if not cached
 */
export const getCachedGoogleCalendarId = async (userId, calendarName = 'Plannr') => {
    const cacheKey = `${userId}:${calendarName}`;
    return googleCalendarCache.get(cacheKey) || null;
};

/**
 * Clear Google Calendar cache for a user
 * @param {string} userId - Clerk user ID
 * @param {string} calendarName - Calendar name (optional, if not provided clears all calendars for user)
 */
export const clearGoogleCalendarCache = async (userId, calendarName = null) => {
    if (calendarName) {
        const cacheKey = `${userId}:${calendarName}`;
        googleCalendarCache.delete(cacheKey);
    } else {
        // Clear all calendars for this user
        for (const key of googleCalendarCache.keys()) {
            if (key.startsWith(`${userId}:`)) {
                googleCalendarCache.delete(key);
            }
        }
    }
};
