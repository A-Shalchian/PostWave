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
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'uploading':
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getPlatformIcon = (platform: Post['platform']) => {
    switch (platform) {
      case 'youtube':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        )
      case 'tiktok':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-slate-950 to-black rounded-lg flex items-center justify-center border border-cyan-400/20">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        )
      case 'instagram':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            PostWave
          </Link>
          <UserMenu userEmail={user.email || ''} avatarUrl={avatarUrl} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Post History</h1>
            <Link
              href="/dashboard"
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <p className="text-slate-400">View all your posting attempts across platforms</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
            <p className="text-red-400">Failed to load posts. Please try again.</p>
          </div>
        )}

        {postsData.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-slate-400 mb-6">Upload a video and post it to get started!</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {postsData.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Platform Icon */}
                  {getPlatformIcon(post.platform)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-400 truncate">
                          Video: {post.videos.title || post.videos.file_name}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(post.status)}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>

                    {/* Description */}
                    {post.description && (
                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                        {post.description}
                      </p>
                    )}

                    {/* Error Message */}
                    {post.status === 'failed' && post.error_message && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-400">
                          <span className="font-semibold">Error:</span> {post.error_message}
                        </p>
                        {post.retry_count > 0 && (
                          <p className="text-xs text-red-400/60 mt-1">
                            Retries: {post.retry_count}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="capitalize">{post.platform}</span>
                        <span>•</span>
                        <span>{formatDate(post.created_at)}</span>
                        {post.published_at && (
                          <>
                            <span>•</span>
                            <span className="text-green-400">Published {formatDate(post.published_at)}</span>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {post.platform_url && post.status === 'published' && (
                          <a
                            href={post.platform_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5 border border-cyan-500/20"
                          >
                            <span>View Post</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
