# Google Calendar OAuth Setup for Clerk

To enable Google Calendar integration with the required scopes, you need to configure your Clerk application properly.

## Required Google OAuth Scopes

For the Google Calendar integration to work, your Clerk Google OAuth application needs these scopes:

1. **Basic scopes** (usually included by default):
   - `openid`
   - `profile` 
   - `email`

2. **Calendar scope** (required for the integration):
   - `https://www.googleapis.com/auth/calendar.events`

## Clerk Dashboard Configuration

### Step 1: Access OAuth Settings
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **User & Authentication** → **Social Connections**
4. Find **Google** and click **Configure**

### Step 2: Configure Google OAuth
1. In the Google OAuth configuration:
   - Ensure **Google** is enabled
   - Click on **Advanced** or **Scopes** section
   - Add the calendar scope: `https://www.googleapis.com/auth/calendar.events`

### Step 3: Google Cloud Console Setup
Make sure your Google Cloud Console project (linked to Clerk) has:

1. **APIs enabled**:
   - Google Calendar API
   - Google People API (for user info)

2. **OAuth consent screen** configured with:
   - App name, logo, contact info
   - Authorized domains including your app domains
   - Scopes including calendar.events

3. **OAuth 2.0 credentials** configured with:
   - Correct redirect URIs for Clerk
   - Both web and mobile app types if needed

### Step 4: Test Configuration
1. In your Clerk Dashboard, use the **Test OAuth** feature
2. Verify that the calendar scope appears in the consent screen
3. Check that the token includes the calendar scope

## Frontend Implementation

The frontend now handles OAuth re-authorization automatically:

```javascript
// When user needs calendar permissions, this triggers the OAuth flow
const handleGoogleCalendarAuth = async () => {
    const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google'
    });
    
    if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // User now has calendar permissions
    }
};
```

## Backend Implementation

The backend checks for the required scope:

```javascript
// In integrations.controllers.js
const oauthTokens = await clerkClient.users.getUserOauthAccessToken(userId, 'google');
const tokenData = oauthTokens[0];

// Verify required scope is present
if (!tokenData.scopes || !tokenData.scopes.includes(REQUIRED_SCOPE)) {
    throw new Error('GOOGLE_CALENDAR_NOT_CONNECTED');
}
```

## Troubleshooting

### Common Issues:

1. **"Scope not granted" errors**
   - Check that calendar scope is configured in Clerk
   - Verify Google Cloud Console has Calendar API enabled
   - Ensure OAuth consent screen includes calendar scope

2. **"Access denied" errors**
   - User may have denied calendar permissions
   - Try the re-authorization flow again
   - Check Google account permissions in Google Account settings

3. **"Invalid scope" errors**
   - Verify the exact scope string: `https://www.googleapis.com/auth/calendar.events`
   - Check that Google Cloud Console project has Calendar API enabled

### Testing:

1. **Test with a fresh user account** that hasn't connected Google yet
2. **Test re-authorization** with an existing user who connected without calendar scope
3. **Verify scope in token** by checking the backend logs or Clerk user data

## User Flow

1. **New user**: Will see Google OAuth consent with calendar permissions
2. **Existing user without calendar scope**: Will be prompted to re-authorize when trying to export
3. **Existing user with calendar scope**: Export works immediately

The frontend handles all these scenarios automatically with appropriate user feedback.
