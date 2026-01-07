# Google Calendar OAuth Fix - "You're already signed in" Error

This document explains the fix for the "You're already signed in" error when trying to add Google Calendar permissions to existing users.

## The Problem

When users who are already authenticated with Google (but without Calendar permissions) try to export to Google Calendar, they encounter:
```
ERROR: You're already signed in.
```

This happens because:
1. User is already authenticated with Google OAuth via Clerk
2. They have basic scopes (profile, email) but not Calendar scope
3. `startSSOFlow` fails because they're already signed in
4. We need additional permissions, not a new sign-in

## The Solution

### 1. Fixed User Experience
Instead of trying complex OAuth re-authorization, we now:

- **Detect the issue**: When Calendar permissions are missing
- **Guide the user**: Provide clear instructions on how to fix it
- **Offer retry**: Allow users to try export again after fixing permissions
- **Provide alternatives**: Multiple ways to resolve the issue

### 2. Implementation Details

The fix involves three key changes:

#### A. Simplified Auth Handler
```javascript
const handleGoogleCalendarAuth = async () => {
    // No longer tries startSSOFlow for existing users
    // Instead provides user guidance
    Alert.alert(
        'Google Calendar Permissions Needed',
        'Your Google account is connected, but we need additional calendar permissions...',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reconnect', onPress: showGuidance }
        ]
    );
};
```

#### B. Enhanced Error Handling  
```javascript
// More specific error messages
// Multiple action options (Fix Connection, Try Again)
// Retry mechanism with delays
```

#### C. Retry Mechanism
```javascript
// Automatic retry with delay for permission propagation
setTimeout(() => {
    handleExportToGoogleCalendar();
}, 2000);
```

### 3. User Flow Options

#### Option 1: Clerk Dashboard (Recommended)
**For App Admin:**
1. Go to Clerk Dashboard → Social Connections → Google
2. Add Calendar scope: `https://www.googleapis.com/auth/calendar.events`
3. Existing users will get Calendar permissions on next login

#### Option 2: Manual Reconnection
**For Users:**
1. Go to Account Settings
2. Disconnect Google account  
3. Reconnect and allow Calendar permissions
4. Try export again

#### Option 3: Wait and Retry
**For Users:**
1. Try the export again after a few minutes
2. Sometimes permissions take time to propagate
3. Use the "Try Again" button in error dialogs

### 4. Best Practices

#### Immediate Fixes:
- ✅ No more "You're already signed in" errors
- ✅ Clear user guidance instead of technical errors
- ✅ Multiple resolution paths
- ✅ Retry mechanisms for permission propagation

#### Long-term Improvements:
- Configure Calendar scope in Clerk Dashboard from the start
- Consider using Clerk's connection management UI
- Add user account settings for OAuth connections
- Implement proper scope checking in backend

### 5. Testing the Fix

1. **Test with existing user** (has Google connected, no Calendar scope)
2. **Should see**: Guidance message instead of error
3. **Options available**: Fix Connection, Try Again, Cancel
4. **Retry works**: Can attempt export multiple times
5. **No crashes**: Graceful error handling throughout

### 6. Monitoring

The fix includes enhanced logging:
- `google_calendar_auth_cancelled`: User cancelled auth flow
- `google_calendar_guidance_shown`: User saw guidance message  
- `google_calendar_retry_after_guidance`: User tried export after guidance
- `google_calendar_export_retry`: User used retry mechanism

This helps track how users resolve the Calendar permissions issue.

## Summary

The fix transforms a technical OAuth error into a user-friendly flow that:
1. **Explains** what's needed (Calendar permissions)
2. **Guides** users on how to fix it
3. **Provides** multiple resolution options
4. **Allows** retrying without app restart
5. **Tracks** success/failure rates for monitoring

No more "You're already signed in" errors - users now get actionable guidance!
