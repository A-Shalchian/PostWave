import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { full_name } = body

    // Validate input
    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json(
        { error: 'Full name is required and must be a string' },
        { status: 400 }
      )
    }

    // Trim and validate length
    const trimmedName = full_name.trim()
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Full name cannot be empty' },
        { status: 400 }
      )
    }
    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Full name cannot exceed 100 characters' },
        { status: 400 }
      )
    }

    // Upsert user profile (insert if doesn't exist, update if it does)
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          full_name: trimmedName
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
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
