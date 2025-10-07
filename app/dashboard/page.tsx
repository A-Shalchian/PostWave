import { createClient } from '@/lib/supabase/server'
import SignInButton from '@/components/SignInButton'
import SignOutButton from '@/components/SignOutButton'
import ConnectButton from '@/components/ConnectButton'
import VideoUpload from '@/components/VideoUpload'
import VideoList from '@/components/VideoList'
import DeleteAccountButton from '@/components/DeleteAccountButton'

type Connection = {
  platform: string
  platform_username?: string | null
  is_active?: boolean
}

type Video = {
  id: string
  title: string
  file_name: string
  file_size: number
  created_at: string
  status: string
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's connected platforms
  let connections: Connection[] = []
  let videos: Video[] = []

  if (user) {
    const { data: connectionsData } = await supabase
      .from('social_connections')
      .select('platform, platform_username, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)

    connections = connectionsData || []

    // Get user's videos
    const { data: videosData } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    videos = videosData || []
  }

  const isConnected = (platform: string) => {
    return connections.some(c => c.platform === platform)
  }

  const getUsername = (platform: string) => {
    return connections.find(c => c.platform === platform)?.platform_username
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">PostWave</h1>
          {user && <SignOutButton />}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!user ? (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">Welcome to PostWave</h2>
            <p className="text-slate-400">Sign in to start posting to multiple platforms</p>
            <SignInButton />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Dashboard</h2>
              <p className="text-slate-300 mt-2">Welcome back, <span className="text-cyan-400">{user.email}</span></p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-2 text-white">Connect Platforms</h3>
              <p className="text-slate-300 mb-8">
                Link your social media accounts to start cross-posting
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* YouTube Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300 ease-out group hover:shadow-xl hover:shadow-red-500/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">YouTube</h4>
                      {isConnected('youtube') && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          {getUsername('youtube')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-6">Upload videos to your channel and grow your audience</p>
                  <ConnectButton
                    platform="youtube"
                    isConnected={isConnected('youtube')}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 ease-out font-medium hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 cursor-pointer"
                  />
                </div>

                {/* TikTok Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-400/30 transition-all duration-300 ease-out group hover:shadow-xl hover:shadow-cyan-400/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-950 to-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-cyan-400/20">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">TikTok</h4>
                      {isConnected('tiktok') && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          {getUsername('tiktok')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-6">Share short-form content and reach millions of viewers</p>
                  <ConnectButton
                    platform="tiktok"
                    isConnected={isConnected('tiktok')}
                    className="w-full bg-gradient-to-r from-slate-950 to-black text-white py-3 rounded-lg hover:from-black hover:to-slate-900 transition-all duration-300 ease-out font-medium hover:scale-105 active:scale-95 shadow-lg border border-cyan-400/30 hover:border-cyan-400/50 cursor-pointer"
                  />
                </div>

                {/* Instagram Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-pink-500/30 transition-all duration-300 ease-out group hover:shadow-xl hover:shadow-pink-500/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">Instagram</h4>
                      {isConnected('instagram') && (
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          {getUsername('instagram')}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-6">Post reels and stories to engage with your followers</p>
                  <ConnectButton
                    platform="instagram"
                    isConnected={isConnected('instagram')}
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-3 rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 ease-out font-medium hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Video Upload Section */}
            {isConnected('youtube') && <VideoUpload />}

            {/* Video List Section */}
            {videos.length > 0 && (
              <VideoList
                videos={videos}
                hasYouTubeConnection={isConnected('youtube')}
              />
            )}

            {/* Account Settings */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-2 text-white">Account Settings</h3>
              <p className="text-slate-300 mb-6">
                Manage your account and data
              </p>
              <div className="max-w-md">
                <DeleteAccountButton />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
