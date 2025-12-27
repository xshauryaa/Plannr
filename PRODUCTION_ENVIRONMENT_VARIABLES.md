# 🔧 MISSING ENVIRONMENT VARIABLES FOR PRODUCTION

## Required Microsoft OAuth Environment Variables for Render Deployment

Based on the MicrosoftOAuthController.js requirements, these environment variables are missing from the Render deployment:

### ✅ Microsoft App Registration Details
```bash
# Microsoft Client ID (from Azure App Registration)
MICROSOFT_CLIENT_ID=a05a33e9-bfe0-4b22-865a-0ce9d269090d

# Microsoft Client Secret (generated in Azure App Registration)
MICROSOFT_CLIENT_SECRET=your-client-secret-here

# Microsoft Redirect URI (must match Azure App Registration)
MICROSOFT_REDIRECT_URI=https://plannr-690n.onrender.com/api/import/auth/microsoft/callback
```

### 🔐 Encryption Key for Token Storage
```bash
# AES-256-GCM encryption key (32 bytes base64)
ENCRYPTION_KEY=your-32-byte-base64-key-here
```

### 📝 How to Add Environment Variables to Render:

1. **Go to Render Dashboard**
   - Navigate to your `plannr-690n` service
   - Click on "Environment" tab

2. **Add Each Variable**
   - Click "Add Environment Variable"
   - Enter key-value pairs from above
   - Save changes

3. **Trigger Redeploy**
   - After adding all variables
   - Click "Manual Deploy" to redeploy with new environment variables

### 🔍 Variables Already Set (from previous setup):
- ✅ DATABASE_URL
- ✅ NODE_ENV=production  
- ✅ PORT (automatically set by Render)
- ✅ API_URL=https://plannr-690n.onrender.com

### ❌ Missing Variables Causing 500 Errors:
- ❌ MICROSOFT_CLIENT_ID (required by MicrosoftOAuthController)
- ❌ MICROSOFT_CLIENT_SECRET (optional but recommended)
- ❌ MICROSOFT_REDIRECT_URI (required by MicrosoftOAuthController)
- ❌ ENCRYPTION_KEY (required by EncryptionService)

## 🚨 Current Issue:
The MicrosoftOAuthController constructor throws error on line 25:
```javascript
if (!this.clientId || !this.redirectUri) {
  throw new Error('Missing required Microsoft OAuth configuration');
}
```

This is why all import endpoints return 500 errors - the module fails to initialize due to missing environment variables.

## 🎯 Next Steps:
1. Add the 4 missing environment variables to Render
2. Redeploy the service
3. Test the import endpoints again
4. They should work correctly after environment variables are set

## 📋 Microsoft App Registration Confirmation:
- App ID: a05a33e9-bfe0-4b22-865a-0ce9d269090d
- Redirect URI: https://plannr-690n.onrender.com/api/import/auth/microsoft/callback
- Permissions: Tasks.Read, Calendars.Read, offline_access
- Multi-tenant: Yes (common endpoint)
