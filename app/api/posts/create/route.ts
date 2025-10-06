import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface PostPlatformData {
  platform: 'youtube' | 'tiktok' | 'instagram'
  title: string
  description: string
  tags?: string[]
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { video_id, platforms } = body as {
      video_id: string
      platforms: PostPlatformData[]
    }

    if (!video_id || !platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify video exists and belongs to user
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', video_id)
      .eq('user_id', user.id)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Get video URL from storage
    const { data: urlData } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.file_path, 3600) // 1 hour expiry

    if (!urlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to get video URL' }, { status: 500 })
    }

    const videoUrl = urlData.signedUrl

    // Create posts for each platform
    const postPromises = platforms.map(async (platformData) => {
      // Get platform connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platformData.platform)
        .eq('is_active', true)
        .single()

      if (connectionError || !connection) {
        throw new Error(`${platformData.platform} not connected`)
      }

      // Create post record
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          video_id,
          user_id: user.id,
          platform: platformData.platform,
          title: platformData.title,
          description: platformData.description,
          tags: platformData.tags || [],
          status: 'pending',
        })
        .select()
        .single()

      if (postError) {
        throw postError
      }

      // Trigger platform-specific posting
      try {
        let result
        switch (platformData.platform) {
          case 'youtube':
            result = await postToYouTube(connection, video, platformData, videoUrl)
            break
          case 'tiktok':
            result = await postToTikTok(connection, video, platformData, videoUrl)
            break
          case 'instagram':
            result = await postToInstagram(connection, video, platformData, videoUrl)
            break
        }

        // Update post with success status
        await supabase
          .from('posts')
          .update({
            status: 'published',
            platform_post_id: result.id,
            platform_url: result.url,
            posted_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        return { ...post, status: 'published', platform_url: result.url }
      } catch (error: any) {
        // Update post with error status
        await supabase
          .from('posts')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', post.id)

        return { ...post, status: 'failed', error_message: error.message }
      }
    })

    const posts = await Promise.all(postPromises)

    return NextResponse.json({
      success: true,
      posts,
    })
  } catch (error: any) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create posts' }, { status: 500 })
  }
}

// YouTube posting function
async function postToYouTube(connection: any, video: any, data: PostPlatformData, videoUrl: string) {
  // Download video from Supabase storage
  const videoResponse = await fetch(videoUrl)
  const videoBlob = await videoResponse.blob()

  // Upload to YouTube
  const metadata = {
    snippet: {
      title: data.title,
      description: data.description,
      tags: data.tags || [],
    },
    status: {
      privacyStatus: 'public',
    },
  }

  // First, create the video resource
  const createResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  })

  const uploadUrl = createResponse.headers.get('Location')
  if (!uploadUrl) {
    throw new Error('Failed to get YouTube upload URL')
  }

  // Upload the video file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': video.mime_type,
    },
    body: videoBlob,
  })

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload video to YouTube')
  }

  const result = await uploadResponse.json()

  return {
    id: result.id,
    url: `https://www.youtube.com/watch?v=${result.id}`,
  }
}

// TikTok posting function
async function postToTikTok(connection: any, video: any, data: PostPlatformData, videoUrl: string) {
  // TikTok requires video to be uploaded in chunks
  // This is a simplified version

  // Initialize upload
  const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: data.title,
        description: data.description,
        privacy_level: 'PUBLIC_TO_EVERYONE',
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: video.file_size,
      },
    }),
  })

  if (!initResponse.ok) {
    throw new Error('Failed to initialize TikTok upload')
  }

  const initData = await initResponse.json()
  const uploadUrl = initData.data.upload_url
  const publishId = initData.data.publish_id

  // Download and upload video
  const videoResponse = await fetch(videoUrl)
  const videoBlob = await videoResponse.blob()

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: videoBlob,
  })

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload video to TikTok')
  }

  // Check publish status
  const statusResponse = await fetch(`https://open.tiktokapis.com/v2/post/publish/status/${publishId}/`, {
    headers: {
      Authorization: `Bearer ${connection.access_token}`,
    },
  })

  const statusData = await statusResponse.json()

  return {
    id: publishId,
    url: statusData.data?.share_url || '',
  }
}

// Instagram posting function
async function postToInstagram(connection: any, video: any, data: PostPlatformData, videoUrl: string) {
  // Instagram requires the video to be publicly accessible
  // First, create a media container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${connection.platform_user_id}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: `${data.title}\n\n${data.description}`,
        access_token: connection.access_token,
      }),
    }
  )

  if (!containerResponse.ok) {
    const error = await containerResponse.json()
    throw new Error(`Failed to create Instagram media container: ${error.error?.message}`)
  }

  const containerData = await containerResponse.json()
  const containerId = containerData.id

  // Poll for container status (Instagram needs time to process)
  let attempts = 0
  const maxAttempts = 30 // 5 minutes max

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds

    const statusResponse = await fetch(
      `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${connection.access_token}`
    )

    const statusData = await statusResponse.json()

    if (statusData.status_code === 'FINISHED') {
      // Publish the media
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${connection.platform_user_id}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: connection.access_token,
          }),
        }
      )

      if (!publishResponse.ok) {
        throw new Error('Failed to publish Instagram media')
      }

      const publishData = await publishResponse.json()

      return {
        id: publishData.id,
        url: `https://www.instagram.com/p/${publishData.id}/`,
      }
    } else if (statusData.status_code === 'ERROR') {
      throw new Error('Instagram media processing failed')
    }

    attempts++
  }

  throw new Error('Instagram media processing timeout')
}
