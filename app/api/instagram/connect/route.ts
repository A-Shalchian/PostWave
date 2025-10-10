import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Instagram OAuth configuration (via Facebook Graph API)
  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`

  if (!clientId) {
    return NextResponse.json({ error: 'Instagram OAuth not configured' }, { status: 500 })
  }

  // Generate cryptographically secure random state token (CSRF protection)
  const stateToken = randomBytes(32).toString('hex') // 64 character hex string
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  // Store state token in database (single-use, expires after 10 minutes)
  const { error: stateError } = await supabase
    .from('oauth_states')
    .insert({
      state_token: stateToken,
      user_id: user.id,
      platform: 'instagram',
      expires_at: expiresAt.toISOString()
    })

  if (stateError) {
    console.error('Failed to store OAuth state:', stateError)
    return NextResponse.json({ error: 'Failed to initialize OAuth' }, { status: 500 })
  }

  // Instagram OAuth scopes (requires Facebook Business account)
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_read_engagement',
    'pages_show_list',
  ].join(',')

  // Build OAuth URL (Facebook Login for Instagram)
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', stateToken) // Use secure random token instead of user ID

  return NextResponse.redirect(authUrl.toString())
}
