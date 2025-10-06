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
      .eq('platform', 'youtube')
      .single()

    // Revoke the token with Google
    if (connection?.access_token) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.access_token}`, {
        method: 'POST',
      })
    }

    // Delete the connection from database
    const { error: deleteError } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'youtube')

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('YouTube disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect YouTube' }, { status: 500 })
  }
}
