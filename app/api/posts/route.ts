import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get all posts for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('video_id')
  const platform = searchParams.get('platform')

  try {
    let query = supabase
      .from('posts')
      .select('*, videos(title, file_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (videoId) {
      query = query.eq('video_id', videoId)
    }

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
