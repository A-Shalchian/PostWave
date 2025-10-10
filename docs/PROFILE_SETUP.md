# Profile Editing Setup Guide

## ✅ What's Been Done

### 1. **Schema Updates** (`supabase/rls.sql`)
- Added storage policies for `avatars` bucket
- Avatars are publicly readable (profile pictures)
- Only users can upload/update/delete their own avatars

### 2. **API Endpoints Created**
- **PATCH** `/api/profile/update` - Update full name
- **POST** `/api/profile/avatar` - Upload new avatar
- **DELETE** `/api/profile/avatar` - Remove avatar

### 3. **UI Components Updated**
- `ProfileContent.tsx` - Added edit mode with avatar upload
- `UserMenu.tsx` - Now displays avatar if uploaded
- Updated `dashboard/page.tsx`, `profile/page.tsx`, `player/[id]/page.tsx` to pass avatar URLs

## 🔧 What You Need to Do in Supabase

### Step 1: Create the `avatars` Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `avatars`
4. **Public bucket**: ✅ **Check this** (so avatars are publicly viewable)
5. Click **"Create bucket"**

### Step 2: Run the Updated RLS Policies

Run the updated `supabase/rls.sql` file in the SQL Editor:

```bash
# If using Supabase CLI
supabase db push

# OR manually in Supabase Dashboard:
# Go to SQL Editor → paste the contents of supabase/rls.sql → Run
```

**Note:** The `avatars` storage policies are already included in your updated `rls.sql` file!

## 🧪 How to Test

1. **Start your app**
   ```bash
   npm run dev
   ```

2. **Navigate to Profile Page** (`/profile`)
3. Click **"Edit Profile"** button
4. **Change your name** → Click "Save Changes"
5. **Upload avatar**:
   - Click the camera icon on your avatar
   - Select an image (JPEG, PNG, WebP, GIF, max 5MB)
   - Avatar updates automatically
6. **Check UserMenu** - Your avatar should now appear in the top-right dropdown

## 📋 Features Added

### Profile Editing
- ✅ Edit full name
- ✅ Upload custom avatar (5MB max)
- ✅ Remove avatar
- ✅ Real-time validation
- ✅ Success/error messages
- ✅ Loading states

### Avatar Display
- ✅ Shows in UserMenu dropdown
- ✅ Shows on profile page
- ✅ Fallback to email initial if no avatar
- ✅ Public URLs (no signed URLs needed)

## 🔒 Security Features

- Only authenticated users can upload/update profiles
- Users can only edit their own profile
- File type validation (images only)
- File size validation (5MB max)
- Old avatars are automatically deleted on upload
- RLS policies prevent unauthorized access

## 📁 Files Modified

### New Files
- `app/api/profile/update/route.ts`
- `app/api/profile/avatar/route.ts`
- `PROFILE_SETUP.md` (this file)

### Updated Files
- `supabase/rls.sql` - Added avatars storage policies
- `components/ProfileContent.tsx` - Added edit form and avatar upload
- `components/UserMenu.tsx` - Added avatar display
- `app/dashboard/page.tsx` - Fetch and pass avatar URL
- `app/profile/page.tsx` - Pass avatar URL to UserMenu
- `app\player\[id]\page.tsx` - Fetch and pass avatar URL

## ⚠️ Important Notes

1. **The `avatars` bucket MUST be created** before testing
2. **The bucket MUST be public** for avatars to display properly
3. Schema tables (`user_profiles`) already support this - no changes needed!
4. RLS policies already allow profile updates - already in your schema!

## 🎨 Avatar Storage Structure

```
avatars/
└── {user_id}/
    └── {timestamp}.{ext}
```

Example: `avatars/550e8400-e29b-41d4-a716-446655440000/1696502400000.jpg`

---

**You're all set!** Just create the `avatars` bucket in Supabase and you're ready to test! 🚀
