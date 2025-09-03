# Google OAuth Setup Guide for Tutor Notes

## Overview
This guide will help you set up Google OAuth authentication for your Tutor Notes application using Supabase.

## Prerequisites
- Supabase project already created
- Google Cloud Console access
- Domain or localhost for development

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your **Project ID**

### 1.2 Enable APIs
1. Go to **APIs & Services → Library**
2. Search for and enable these APIs:
   - **Google+ API**
   - **Google Identity and Access Management (IAM) API**

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - **App name**: Tutor Notes
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Add test users (your email) if in testing mode

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   https://pjcjnmqoaajtotqqqsxs.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
5. Copy your **Client ID** and **Client Secret**

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`pjcjnmqoaajtotqqqsxs`)
3. Navigate to **Authentication → Providers**
4. Find **Google** and click **Enable**

### 2.2 Configure Google Provider
1. **Client ID**: Paste your Google OAuth Client ID
2. **Client Secret**: Paste your Google OAuth Client Secret
3. **Redirect URL**: `https://pjcjnmqoaajtotqqqsxs.supabase.co/auth/v1/callback`
4. **Save** the configuration

### 2.3 Configure Site URL
1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
3. Set **Redirect URLs**:
   ```
   https://yourdomain.com/**
   http://localhost:3000/**
   ```

## Step 3: Environment Variables

### 3.1 Create .env.local file
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://pjcjnmqoaajtotqqqsxs.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Optional - for additional configuration)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3.2 Get Supabase Keys
1. Go to **Settings → API** in Supabase Dashboard
2. Copy **Project URL** and **anon public** key
3. Update your `.env.local` file

## Step 4: Test Google OAuth

### 4.1 Test in Development
1. Start your development server: `npm start`
2. Go to login page
3. Click "Continue with Google"
4. You should be redirected to Google OAuth
5. After authentication, you should be redirected back to your app

### 4.2 Test in Production
1. Deploy your app
2. Test Google OAuth flow
3. Verify user creation in Supabase

## Step 5: Troubleshooting

### Common Issues

#### 1. "Invalid redirect_uri" Error
- Check that redirect URI in Google Console matches Supabase callback URL
- Ensure no trailing slashes or extra characters

#### 2. "OAuth provider not configured" Error
- Verify Google provider is enabled in Supabase
- Check Client ID and Secret are correct

#### 3. User not created in profiles table
- Check that `handle_new_user` trigger is working
- Verify RLS policies allow profile creation

#### 4. Redirect loop
- Check Site URL configuration in Supabase
- Verify redirect URLs are correct

### Debug Steps
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables are loaded
4. Test with different browsers/devices

## Step 6: Security Considerations

### 1. HTTPS Required in Production
- Google OAuth requires HTTPS in production
- Localhost is allowed for development

### 2. Client Secret Security
- Never expose Client Secret in frontend code
- Use environment variables
- Rotate secrets regularly

### 3. Redirect URI Validation
- Only allow necessary redirect URIs
- Remove development URIs in production

## Step 7: Advanced Configuration

### 1. Custom Scopes
You can request additional scopes in your OAuth request:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        scopes: 'email profile',
        redirectTo: `${window.location.origin}/dashboard`
    }
})
```

### 2. Custom Redirect Handling
```javascript
// Handle OAuth callback
useEffect(() => {
    const { data: { user } } = supabase.auth.getUser()
    if (user) {
        // Handle successful authentication
        navigate('/dashboard')
    }
}, [])
```

## Support

If you encounter issues:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/social-login/auth-google
2. Check Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
3. Review Supabase logs in dashboard
4. Check browser console for errors

## Next Steps

After successful setup:
1. Test user registration and login
2. Verify profile creation
3. Test user session management
4. Implement logout functionality
5. Add user profile management

