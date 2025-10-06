import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignInButton from '@/components/SignInButton'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">PostWave</h1>
          <SignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <span className="text-cyan-400 text-sm font-medium">Multi-Platform Content Distribution</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Upload Once,<br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Post Everywhere
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
          Share your videos to TikTok, YouTube, Instagram, and more with a single click. Save time and grow your audience across all platforms.
        </p>
        <SignInButton />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4 text-white">Why PostWave?</h2>
        <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto">
          Built for creators who want to maximize reach without the repetitive work
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 ease-out hover:scale-105 cursor-pointer group">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ease-out">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Lightning Fast</h3>
            <p className="text-slate-400">Post to multiple platforms in seconds, not hours. Streamline your content workflow.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 ease-out hover:scale-105 cursor-pointer group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ease-out">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Customize Per Platform</h3>
            <p className="text-slate-400">Tailor your content for each platform&apos;s unique audience and requirements.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 ease-out hover:scale-105 cursor-pointer group">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ease-out">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Track Performance</h3>
            <p className="text-slate-400">Monitor your posts across all platforms in one unified dashboard.</p>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="border-t border-slate-800 bg-slate-900/30 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Supported Platforms</h2>
          <p className="text-slate-400 mb-16">Connect all your favorite platforms in one place</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-red-500/50 transition-all duration-300 ease-out group cursor-pointer hover:scale-105">
              <div className="text-3xl font-bold text-red-500 group-hover:scale-110 transition-transform duration-300 ease-out">YouTube</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-white/50 transition-all duration-300 ease-out group cursor-pointer hover:scale-105">
              <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300 ease-out">TikTok</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-pink-500/50 transition-all duration-300 ease-out group cursor-pointer hover:scale-105">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 ease-out">Instagram</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-3xl p-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to grow your audience?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">Start posting to multiple platforms today and save hours every week</p>
          <SignInButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500">
          <p>&copy; 2025 PostWave. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
