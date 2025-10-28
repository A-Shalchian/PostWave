import { createClient } from '@/lib/supabase/server'
import SignInButton from '@/components/SignInButton'
import UserMenu from '@/components/UserMenu'
import ConnectButton from '@/components/ConnectButton'
import VideoUpload from '@/components/VideoUpload'
import VideoList from '@/components/VideoList'

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
  let avatarUrl: string | null = null

  if (user) {
    // Get user profile for avatar
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    avatarUrl = profile?.avatar_url || null

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
    <div className="min-h-screen bg-black">
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">PostWave</h1>
          {user && <UserMenu userEmail={user.email || ''} avatarUrl={avatarUrl} />}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {!user ? (
          <div className="text-center space-y-8 py-20">
            <h2 className="text-4xl font-bold text-white">Welcome to PostWave</h2>
            <p className="text-xl text-white/40">Sign in to start posting to multiple platforms</p>
            <SignInButton />
          </div>
        ) : (
          <div className="space-y-12">
            <div className="border-b border-white/5 pb-8">
              <h2 className="text-4xl font-bold text-white tracking-tight mb-3">Dashboard</h2>
              <p className="text-lg text-white/40">Welcome back, <span className="text-white">{user.email}</span></p>
            </div>

            <div className="border border-white/5 bg-white/[0.02] p-10">
              <h3 className="text-2xl font-bold mb-2 text-white tracking-tight">Connect Platforms</h3>
              <p className="text-white/40 mb-10 text-lg">
                Link your social media accounts to start cross-posting
              </p>

              <div className="grid md:grid-cols-3 gap-px bg-white/5">
                {/* YouTube Card */}
                <div className="bg-black p-8 hover:bg-white/[0.02] transition-colors group">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">YouTube</h4>
                    {isConnected('youtube') && (
                      <p className="text-sm text-white/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {getUsername('youtube')}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">Upload videos to your channel and grow your audience</p>
                  <ConnectButton
                    platform="youtube"
                    isConnected={isConnected('youtube')}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 font-medium hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  />
                </div>

                {/* TikTok Card */}
                <div className="bg-black p-8 hover:bg-white/[0.02] transition-colors group border-x border-white/5">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">TikTok</h4>
                    {isConnected('tiktok') && (
                      <p className="text-sm text-white/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {getUsername('tiktok')}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">Share short-form content and reach millions of viewers</p>
                  <ConnectButton
                    platform="tiktok"
                    isConnected={isConnected('tiktok')}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 font-medium hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  />
                </div>

                {/* Instagram Card */}
                <div className="bg-black p-8 hover:bg-white/[0.02] transition-colors group">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">Instagram</h4>
                    {isConnected('instagram') && (
                      <p className="text-sm text-white/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {getUsername('instagram')}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">Post reels and stories to engage with your followers</p>
                  <ConnectButton
                    platform="instagram"
                    isConnected={isConnected('instagram')}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 font-medium hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Video Upload Section */}
            <VideoUpload />

            {/* Video List Section */}
            {videos.length > 0 && (
              <VideoList
                videos={videos}
                hasYouTubeConnection={isConnected('youtube')}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
