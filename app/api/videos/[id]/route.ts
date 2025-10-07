import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get a specific video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Fetch video error:', error)
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
  }
}

// Delete a video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, get the video to find the file path
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('file_path, thumbnail_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      throw fetchError
    }

    // Delete from storage first
    const filesToDelete = [video.file_path]
    if (video.thumbnail_path) {
      filesToDelete.push(video.thumbnail_path)
    }

    const { error: storageError } = await supabase.storage
      .from('videos')
      .remove(filesToDelete)

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue anyway - we still want to delete the DB record
    }

    // Then delete from database
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
