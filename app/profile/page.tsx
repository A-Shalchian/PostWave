import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import ProfileContent from '@/components/ProfileContent'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's connections
  const { data: connections } = await supabase
    .from('social_connections')
    .select('platform, platform_username, is_active, connected_at')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Get user's video stats
  const { data: videos } = await supabase
    .from('videos')
    .select('file_size')
    .eq('user_id', user.id)

  const totalVideos = videos?.length || 0
  const totalStorage = videos?.reduce((acc, v) => acc + v.file_size, 0) || 0

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            PostWave
          </h1>
          <UserMenu userEmail={user.email || ''} avatarUrl={profile?.avatar_url} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-slate-300 mt-2">Manage your account settings and preferences</p>
        </div>

        <ProfileContent
          user={{
            email: user.email || '',
            created_at: user.created_at
          }}
          profile={profile}
          connections={connections}
          stats={{
            totalVideos,
            totalStorage
          }}
        />
      </main>
    </div>
  )
}
