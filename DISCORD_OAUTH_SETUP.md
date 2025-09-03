# Discord OAuth Setup Guide

This guide will help you replace Apple ID login with Discord OAuth in your Tutor Notes application.

## Prerequisites

- A Supabase project with authentication enabled
- Access to Discord Developer Portal
- Your application deployed or running locally

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Tutor Notes")
4. Click "Create"

## Step 2: Configure OAuth2 Settings

1. In your Discord application dashboard, go to "OAuth2" in the left sidebar
2. Click "General" under OAuth2
3. Add the following redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   Replace `your-project-id` with your actual Supabase project ID
4. Copy the "Client ID" - you'll need this later
5. Click "Reset Secret" to generate a new client secret
6. Copy the "Client Secret" - you'll need this for Supabase

## Step 3: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Find "Discord" in the list of providers
4. Enable Discord authentication
5. Enter the Discord Client ID and Client Secret from Step 2
6. Save the configuration

## Step 4: Update Environment Variables

1. Copy your `.env.template` to `.env.local` (if you haven't already)
2. Add your Discord Client ID:
   ```
   REACT_APP_DISCORD_CLIENT_ID=your_actual_discord_client_id
   ```

## Step 5: Test the Integration

1. Start your application
2. Go to the login page
3. Click the Discord button
4. You should be redirected to Discord for authorization
5. After authorizing, you should be redirected back to your dashboard

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure the redirect URI in Discord exactly matches your Supabase callback URL
   - Check for typos in the URL

2. **Invalid Client ID/Secret**
   - Verify you're using the correct Client ID and Client Secret
   - Make sure you copied them from the right Discord application

3. **CORS Issues**
   - Ensure your Supabase project allows requests from your domain
   - Check the Site URL in your Supabase project settings

4. **Scope Issues**
   - The current implementation uses `identify email` scope
   - If you need additional user data, you may need to request additional scopes

### Testing Locally

When testing locally, make sure your Supabase project has the correct redirect URLs:
- Local: `http://localhost:3000/dashboard`
- Production: `https://yourdomain.com/dashboard`

## Security Considerations

1. **Client Secret**: Never expose your Discord Client Secret in frontend code
2. **Redirect URIs**: Only allow redirect URIs from your trusted domains
3. **Scopes**: Only request the minimum scopes needed for your application

## Additional Discord Features

Discord OAuth provides access to:
- User's Discord ID
- Username and discriminator
- Avatar
- Email (if user has verified email)
- Guild memberships (servers)

You can extend the current implementation to request additional scopes if needed.

## Code Changes Made

The following files were updated to replace Apple ID with Discord:

1. **LoginPage.js**: Updated UI to show Discord button instead of Apple
2. **AuthContext.js**: Changed `signInWithApple` to `signInWithDiscord`
3. **authService.js**: Updated OAuth provider from 'apple' to 'discord'
4. **env.template**: Added Discord OAuth configuration template

## Next Steps

After successful setup:
1. Test the authentication flow thoroughly
2. Update your user profile creation logic if needed
3. Consider adding Discord-specific features like server integration
4. Update your documentation to reflect the new authentication method

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Discord application settings
3. Check Supabase authentication logs
4. Ensure all environment variables are correctly set
