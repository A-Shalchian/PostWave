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
    // Get all social connections to revoke OAuth tokens
    const { data: connections } = await supabase
      .from('social_connections')
      .select('platform, access_token')
      .eq('user_id', user.id)

    // Revoke OAuth tokens for each connected platform
    if (connections && connections.length > 0) {
      await Promise.allSettled(
        connections.map(async (connection) => {
          try {
            switch (connection.platform) {
              case 'youtube':
                // Revoke Google/YouTube token
                if (connection.access_token) {
                  await fetch(`https://oauth2.googleapis.com/revoke?token=${connection.access_token}`, {
                    method: 'POST',
                  })
                }
                break

              case 'tiktok':
                // Revoke TikTok token
                if (connection.access_token) {
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
                break

              case 'instagram':
                // Instagram tokens are automatically revoked when permissions are removed
                // No additional action needed
                break
            }
          } catch (error) {
            console.error(`Failed to revoke ${connection.platform} token:`, error)
            // Continue with deletion even if token revocation fails
          }
        })
      )
    }

    // Delete all videos from storage
    const { data: videos } = await supabase
      .from('videos')
      .select('file_path, thumbnail_path')
      .eq('user_id', user.id)

    if (videos && videos.length > 0) {
      const filesToDelete = videos.flatMap(v =>
        [v.file_path, v.thumbnail_path].filter(Boolean) as string[]
      )

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('videos')
          .remove(filesToDelete)
      }
    }

    // Call the database function to delete user account
    // This will cascade to all related tables
    const { error: deleteError } = await supabase.rpc('delete_user_account')

    if (deleteError) {
      console.error('Delete account error:', deleteError)
      throw new Error('Failed to delete account')
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again.' },
      { status: 500 }
    )
  }
}

// Get account deletion summary (what will be deleted)
export async function GET() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get summary of user data
    const { data: summary } = await supabase
      .from('user_data_summary')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Failed to fetch account summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account information' },
      { status: 500 }
    )
  }
}
