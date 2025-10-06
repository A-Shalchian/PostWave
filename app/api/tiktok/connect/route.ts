import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TikTok OAuth configuration
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`

  if (!clientKey) {
    return NextResponse.json({ error: 'TikTok OAuth not configured' }, { status: 500 })
  }

  // TikTok OAuth scopes
  const scopes = [
    'user.info.basic',
    'video.upload',
    'video.publish',
  ].join(',')

  // Build OAuth URL
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/')
  authUrl.searchParams.set('client_key', clientKey)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('state', user.id) // Pass user ID for verification

  return NextResponse.redirect(authUrl.toString())
}
