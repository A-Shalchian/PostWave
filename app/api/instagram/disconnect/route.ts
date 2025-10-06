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
    // Delete the connection from database
    // Note: Facebook/Instagram tokens are automatically revoked when permissions are removed
    const { error: deleteError } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'instagram')

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instagram disconnect error:', error)
    return NextResponse.json({ error: 'Failed to disconnect Instagram' }, { status: 500 })
  }
}
