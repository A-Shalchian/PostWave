import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_auth_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_callback`)
  }

  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unauthorized`)
  }

  // Validate state token from database (CSRF protection)
  const { data: stateRecord, error: stateError } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('state_token', state)
    .eq('platform', 'tiktok')
    .single()

  if (stateError || !stateRecord) {
    console.error('Invalid OAuth state token:', stateError)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_state`)
  }

  // Check if state token has expired (10 minute timeout)
  if (new Date(stateRecord.expires_at) < new Date()) {
    // Clean up expired token
    await supabase.from('oauth_states').delete().eq('state_token', state)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=state_expired`)
  }

  // Verify the state token belongs to the authenticated user
  if (stateRecord.user_id !== user.id) {
    console.error('State token user mismatch:', { stateUser: stateRecord.user_id, currentUser: user.id })
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unauthorized`)
  }

  // Delete state token (single-use only - prevents replay attacks)
  await supabase.from('oauth_states').delete().eq('state_token', state)

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get TikTok user info
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch TikTok user info')
    }

    const userData = await userResponse.json()
    const tiktokUser = userData.data?.user

    if (!tiktokUser) {
      throw new Error('No TikTok user found')
    }

    // Calculate token expiration
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    // Store connection in database
    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: tiktokUser.open_id,
        platform_username: tiktokUser.display_name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
        is_active: true,
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save connection')
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=tiktok_connected`)
  } catch (error) {
    console.error('TikTok OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_connection_failed`)
  }
}
