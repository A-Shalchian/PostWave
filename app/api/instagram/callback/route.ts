import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=instagram_auth_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_callback`)
  }

  const supabase = await createClient()

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user || user.id !== state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unauthorized`)
  }

  try {
    // Exchange authorization code for short-lived token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.INSTAGRAM_CLIENT_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.INSTAGRAM_CLIENT_SECRET!)
    tokenUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`)
    tokenUrl.searchParams.set('code', code)

    const tokenResp = await fetch(tokenUrl.toString())

    if (!tokenResp.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResp.json()

    // Exchange short-lived token for long-lived token
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.set('client_id', process.env.INSTAGRAM_CLIENT_ID!)
    longLivedUrl.searchParams.set('client_secret', process.env.INSTAGRAM_CLIENT_SECRET!)
    longLivedUrl.searchParams.set('fb_exchange_token', tokens.access_token)

    const longLivedResp = await fetch(longLivedUrl.toString())
    const longLivedTokens = await longLivedResp.json()

    // Get Facebook Pages (needed for Instagram Business accounts)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedTokens.access_token}`
    )

    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch Facebook pages')
    }

    const pagesData = await pagesResponse.json()
    const page = pagesData.data?.[0] // Get first page

    if (!page) {
      throw new Error('No Facebook page found. Instagram Business account requires a Facebook page.')
    }

    // Get Instagram Business Account ID
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    )

    const igAccountData = await igAccountResponse.json()
    const igAccountId = igAccountData.instagram_business_account?.id

    if (!igAccountId) {
      throw new Error('No Instagram Business account linked to this Facebook page')
    }

    // Get Instagram account info
    const igUserResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}?fields=username,name&access_token=${page.access_token}`
    )

    const igUser = await igUserResponse.json()

    // Calculate token expiration (long-lived tokens last 60 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 60)

    // Store connection in database
    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform: 'instagram',
        platform_user_id: igAccountId,
        platform_username: igUser.username,
        access_token: page.access_token, // Use page access token for posting
        token_expires_at: expiresAt.toISOString(),
        scope: tokens.scope || 'instagram_basic,instagram_content_publish',
        is_active: true,
      }, {
        onConflict: 'user_id,platform'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save connection')
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=instagram_connected`)
  } catch (error) {
    console.error('Instagram OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=instagram_connection_failed`)
  }
}
