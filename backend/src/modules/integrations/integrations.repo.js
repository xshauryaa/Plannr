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
 */
export const cacheGoogleCalendarId = async (userId, calendarId) => {
    googleCalendarCache.set(userId, calendarId);
    return calendarId;
};

/**
 * Get cached Google Calendar ID for a user
 * @param {string} userId - Clerk user ID
 * @returns {string|null} Calendar ID or null if not cached
 */
export const getCachedGoogleCalendarId = async (userId) => {
    return googleCalendarCache.get(userId) || null;
};

/**
 * Clear Google Calendar cache for a user
 * @param {string} userId - Clerk user ID
 */
export const clearGoogleCalendarCache = async (userId) => {
    googleCalendarCache.delete(userId);
};
