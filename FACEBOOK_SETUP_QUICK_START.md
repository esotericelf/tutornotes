# Facebook OAuth Quick Start Guide

## Current Facebook App Creation Process (Updated 2024)

### Step 1: Create Facebook App

1. **Go to [Facebook Developers Console](https://developers.facebook.com/)**
2. **Click "Create App"**
3. **Choose App Type:**
   - **Option A**: Select "Consumer" (if available)
   - **Option B**: Select "Business" → then choose "Consumer-facing app" purpose
4. **Fill in App Details:**
   - App Name: `TutorNotes`
   - App Contact Email: Your email
   - App Purpose: Consumer or Consumer-facing app
5. **Click "Create App"**

### Step 2: Add Facebook Login

1. **In your app dashboard, click "Add Product"**
2. **Find "Facebook Login" and click "Set Up"**
3. **Choose "Web" platform**
4. **Enter site URL: `http://localhost:3000`**
5. **Click "Save and Continue"**

### Step 3: Configure OAuth Settings

1. **Go to "Facebook Login" → "Settings"**
2. **Add these Valid OAuth Redirect URIs:**
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
3. **Click "Save Changes"**

### Step 4: Get Credentials

1. **Go to "Settings" → "Basic"**
2. **Copy your "App ID"**
3. **Click "Show" next to "App Secret" and copy it**

### Step 5: Configure Supabase

1. **Go to your Supabase dashboard**
2. **Navigate to "Authentication" → "Providers"**
3. **Find "Facebook" and click "Enable"**
4. **Enter your Facebook App ID and App Secret**
5. **Click "Save"**

### Step 6: Set Environment Variables

1. **Copy `env.template` to `.env.local`**
2. **Add your Facebook App ID:**
   ```bash
   REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
   ```
3. **Restart your development server:**
   ```bash
   npm start
   ```

### Step 7: Test

1. **Go to your login page**
2. **Click "Continue with Facebook"**
3. **Complete the OAuth flow**
4. **You should be redirected to your dashboard**

## Troubleshooting

### "Consumer" app type not available?
- **Use "Business" instead**
- Choose "Consumer-facing app" as the purpose
- This gives you the same functionality

### "App Review Required"?
- **This is normal for new apps**
- You can test with up to 50 users without review
- Submit for review when ready for production

### "Business Verification Required"?
- **Skip this step**
- Only needed for certain business features
- Basic Facebook Login works without it

## Need Help?

- Run the setup script: `./scripts/setup_facebook_oauth.sh`
- Check the full documentation: `docs/FACEBOOK_OAUTH_SETUP.md`
- Facebook OAuth docs: https://developers.facebook.com/docs/facebook-login/
- Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-facebook
