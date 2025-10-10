import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Get current profile to check for existing avatar
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    // Delete old avatar if it exists
    if (currentProfile?.avatar_url) {
      try {
        const oldPath = currentProfile.avatar_url.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      } catch (error) {
        console.warn('Failed to delete old avatar:', error)
        // Continue anyway - not critical
      }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path)

    // Update user profile with new avatar URL (upsert to handle missing profiles)
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        avatar_url: publicUrl
      })
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Try to clean up uploaded file
      await supabase.storage.from('avatars').remove([fileName])
      return NextResponse.json(
        { error: 'Failed to update profile with avatar URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar_url: publicUrl,
      profile
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete avatar
export async function DELETE() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current profile
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    // Delete avatar from storage if it exists
    if (currentProfile?.avatar_url) {
      try {
        const path = currentProfile.avatar_url.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([path])
      } catch (error) {
        console.warn('Failed to delete avatar from storage:', error)
      }
    }

    // Remove avatar URL from profile (upsert to handle missing profiles)
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        avatar_url: null
      })
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Avatar removed successfully',
      profile
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
