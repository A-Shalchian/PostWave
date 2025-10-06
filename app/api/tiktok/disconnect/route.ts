import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get the connection to revoke the token
    const { data: connection } = await supabase
      .from('social_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()

    // Revoke the token with TikTok
    if (connection?.access_token) {
      await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          token: connection.access_token,
        }),
      })
    }

    // Delete the connection from database
    const { error: deleteError } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('TikTok disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect TikTok' }, { status: 500 })
  }
}
