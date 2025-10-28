import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserMenu from '@/components/UserMenu'
import Link from 'next/link'

type Post = {
  id: string
  video_id: string
  platform: 'youtube' | 'tiktok' | 'instagram'
  title: string
  description: string | null
  status: 'pending' | 'uploading' | 'processing' | 'published' | 'failed'
  platform_post_id: string | null
  platform_url: string | null
  error_message: string | null
  retry_count: number
  created_at: string
  published_at: string | null
  videos: {
    title: string
    file_name: string
  }
}

export default async function PostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user profile for avatar
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  const avatarUrl = profile?.avatar_url || null

  // Fetch posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, videos(title, file_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const postsData: Post[] = posts || []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'uploading':
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default:
        return 'bg-white/5 text-white/40 border-white/10'
    }
  }

  const getPlatformName = (platform: Post['platform']) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-white tracking-tight hover:opacity-70 transition-opacity">
            PostWave
          </Link>
          <UserMenu userEmail={user.email || ''} avatarUrl={avatarUrl} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="border-b border-white/5 pb-8 mb-12">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold text-white tracking-tight">Post History</h1>
            <Link
              href="/dashboard"
              className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <p className="text-lg text-white/40">View all your posting attempts across platforms</p>
        </div>

        {error && (
          <div className="bg-white/[0.02] border border-red-500/20 p-6 mb-8">
            <p className="text-red-400">Failed to load posts. Please try again.</p>
          </div>
        )}

        {postsData.length === 0 ? (
          <div className="border border-white/5 bg-white/[0.02] p-16 text-center">
            <div className="w-16 h-16 border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No posts yet</h3>
            <p className="text-lg text-white/40 mb-8">Upload a video and post it to get started</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium hover:bg-white/90 transition-all active:scale-95"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-px bg-white/5">
            {postsData.map((post) => (
              <div
                key={post.id}
                className="bg-black p-8 hover:bg-white/[0.02] transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-white/40 uppercase tracking-wider">{getPlatformName(post.platform)}</span>
                      <span className={`px-2 py-1 text-xs font-medium border ${getStatusColor(post.status)}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-white/40">
                      Video: {post.videos.title || post.videos.file_name}
                    </p>
                  </div>

                  {/* Actions */}
                  {post.platform_url && post.status === 'published' && (
                    <a
                      href={post.platform_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <span>View Post</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Description */}
                {post.description && (
                  <p className="text-white/40 mb-4 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                )}

                {/* Error Message */}
                {post.status === 'failed' && post.error_message && (
                  <div className="bg-red-500/5 border border-red-500/20 p-4 mb-4">
                    <p className="text-sm text-red-400">
                      <span className="font-semibold">Error:</span> {post.error_message}
                    </p>
                    {post.retry_count > 0 && (
                      <p className="text-xs text-red-400/60 mt-2">
                        Retries: {post.retry_count}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-white/30 pt-4 border-t border-white/5">
                  <span>{formatDate(post.created_at)}</span>
                  {post.published_at && (
                    <>
                      <span>•</span>
                      <span className="text-green-400">Published {formatDate(post.published_at)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
