# API Setup Guide

This guide will help you set up OAuth credentials for YouTube, TikTok, and Instagram.

## Prerequisites

1. Apply the database schema in Supabase SQL Editor
2. Create a Supabase Storage bucket named `videos`
3. Copy `.env.example` to `.env.local` and fill in your credentials

## 1. YouTube API Setup

### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **YouTube Data API v3**

### Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/youtube/callback` (development)
   - `https://yourdomain.com/api/youtube/callback` (production)
5. Copy **Client ID** and **Client Secret** to `.env.local`:
   ```
   YOUTUBE_CLIENT_ID=your-client-id
   YOUTUBE_CLIENT_SECRET=your-client-secret
   ```

### Required Scopes
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

---

## 2. TikTok API Setup

### Create TikTok Developer App
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Sign in with your TikTok account
3. Create a new app
4. Request access to **Video Publishing** permissions (requires approval)

### Configure OAuth
1. In your app settings, add redirect URIs:
   - `http://localhost:3000/api/tiktok/callback` (development)
   - `https://yourdomain.com/api/tiktok/callback` (production)
2. Copy **Client Key** and **Client Secret** to `.env.local`:
   ```
   TIKTOK_CLIENT_KEY=your-client-key
   TIKTOK_CLIENT_SECRET=your-client-secret
   ```

### Required Scopes
- `user.info.basic`
- `video.upload`
- `video.publish`

**Note:** TikTok API access requires approval and is primarily available for business accounts.

---

## 3. Instagram API Setup

### Prerequisites
- Facebook Developer Account
- Facebook Page connected to an Instagram Business Account
- Instagram must be a **Business** or **Creator** account

### Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Instagram Graph API** product
4. Add **Facebook Login** product

### Configure OAuth
1. In Facebook Login settings, add redirect URIs:
   - `http://localhost:3000/api/instagram/callback` (development)
   - `https://yourdomain.com/api/instagram/callback` (production)
2. Copy **App ID** and **App Secret** to `.env.local`:
   ```
   INSTAGRAM_CLIENT_ID=your-app-id
   INSTAGRAM_CLIENT_SECRET=your-app-secret
   ```

### Required Permissions
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`
- `pages_show_list`

### Important Notes
- Instagram API only works with Business/Creator accounts
- Requires a connected Facebook Page
- App must pass App Review to post publicly
- During development, you can only post to test accounts

---

## 4. Supabase Storage Setup

### Create Storage Bucket
1. Go to your Supabase project → **Storage**
2. Create a new bucket named `videos`
3. Set bucket to **Private** (RLS will control access)

### Set up Storage Policies
Run this SQL in Supabase SQL Editor:

```sql
-- Policy for users to upload their own videos
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to read their own videos
CREATE POLICY "Users can read their own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Testing

### Test YouTube Connection
1. Start the dev server: `npm run dev`
2. Sign in to your app
3. Click "Connect" on the YouTube card
4. Authorize the app
5. You should be redirected back with a success message

### Test Video Upload
1. Upload a video through the UI
2. Check Supabase Storage to verify the file was uploaded
3. Check the `videos` table to verify the metadata was saved

### Test Posting
1. Upload a video
2. Fill in platform-specific details
3. Click "Post to YouTube/TikTok/Instagram"
4. Check the `posts` table for status updates
5. Verify the video appears on the respective platform

---

## Troubleshooting

### YouTube Errors
- **Invalid grant**: Token expired, user needs to reconnect
- **Quota exceeded**: YouTube API has daily quotas, check Google Cloud Console

### TikTok Errors
- **Forbidden**: App may not have necessary permissions approved
- **Invalid video format**: TikTok requires specific video formats (MP4, MOV)

### Instagram Errors
- **No Instagram Business account**: Ensure account is converted to Business/Creator
- **No Facebook Page**: Connect a Facebook Page to the Instagram account
- **Timeout**: Instagram processing can take several minutes

---

## Production Checklist

- [ ] Update all redirect URIs to production domain
- [ ] Enable HTTPS on your production domain
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Submit apps for review (TikTok, Instagram)
- [ ] Set up rate limiting for API routes
- [ ] Configure monitoring and error tracking
- [ ] Set up backup for Supabase database
- [ ] Configure CDN for Supabase Storage
