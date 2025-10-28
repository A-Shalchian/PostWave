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
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">PostWave</h1>
          <SignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 grid-bg animate-grid-pulse"></div>

        {/* Geometric Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="geometric-ring w-[600px] h-[600px] animate-rotate-ring opacity-20"></div>
          <div className="geometric-ring w-[800px] h-[800px] animate-spin-slow opacity-10" style={{ animationDirection: 'reverse' }}></div>
          <div className="geometric-ring w-[1000px] h-[1000px] animate-rotate-ring opacity-5" style={{ animationDelay: '5s' }}></div>
        </div>

        {/* Animated Beams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="beam-line top-[20%] left-0 animate-beam"></div>
          <div className="beam-line top-[60%] right-0 animate-beam delay-300"></div>
          <div className="beam-line top-[80%] left-0 animate-beam delay-500"></div>
        </div>

        {/* Gradient Orbs - Morphing */}
        <div className="gradient-mesh">
          <div className="gradient-orb w-[600px] h-[600px] bg-blue-600/40 top-10 -left-32 animate-float-slow animate-morph"></div>
          <div className="gradient-orb w-[500px] h-[500px] bg-purple-600/30 -bottom-20 -right-32 animate-float-slow animate-morph delay-200" style={{ animationDelay: '2s' }}></div>
          <div className="gradient-orb w-[400px] h-[400px] bg-cyan-600/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-glow animate-morph delay-400"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-2 h-2 bg-blue-500/30 rounded-full top-[20%] left-[15%] animate-float"></div>
          <div className="absolute w-1.5 h-1.5 bg-purple-500/30 rounded-full top-[40%] right-[20%] animate-float delay-200"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/30 rounded-full bottom-[30%] left-[25%] animate-float delay-300"></div>
          <div className="absolute w-1 h-1 bg-blue-500/40 rounded-full top-[60%] right-[30%] animate-float delay-100"></div>
          <div className="absolute w-1.5 h-1.5 bg-purple-500/40 rounded-full top-[80%] left-[40%] animate-float delay-400"></div>
          <div className="absolute w-2 h-2 bg-cyan-500/40 rounded-full bottom-[20%] right-[15%] animate-float delay-500"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block mb-8 px-5 py-2.5 bg-white/5 border border-white/10 backdrop-blur-sm animate-scale-in opacity-0">
            <span className="text-white/80 text-xs font-medium tracking-[0.2em] uppercase">Multi-Platform Content Distribution</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-bold mb-10 leading-[0.95] tracking-tighter animate-fade-in-up opacity-0 delay-100">
            <span className="block text-white text-shimmer animate-shimmer">Upload Once.</span>
            <span className="block text-white/30 mt-2">Post Everywhere.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/40 max-w-3xl mx-auto mb-14 leading-relaxed animate-fade-in-up opacity-0 delay-300">
            Share your videos to TikTok, YouTube, Instagram, and more with a single click. Save time and grow your audience across all platforms.
          </p>

          <div className="animate-scale-in opacity-0 delay-500">
            <SignInButton />
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Why PostWave?</h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto">
            Built for creators who want to maximize reach without the repetitive work
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/5">
          <div className="bg-black p-10 group hover:bg-white/[0.02] transition-colors">
            <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-blue-500/50 transition-colors">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Lightning Fast</h3>
            <p className="text-white/40 leading-relaxed">Post to multiple platforms in seconds, not hours. Streamline your content workflow.</p>
          </div>

          <div className="bg-black p-10 group hover:bg-white/[0.02] transition-colors border-x border-white/5">
            <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-blue-500/50 transition-colors">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Customize Per Platform</h3>
            <p className="text-white/40 leading-relaxed">Tailor your content for each platform&apos;s unique audience and requirements.</p>
          </div>

          <div className="bg-black p-10 group hover:bg-white/[0.02] transition-colors">
            <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-blue-500/50 transition-colors">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Track Performance</h3>
            <p className="text-white/40 leading-relaxed">Monitor your posts across all platforms in one unified dashboard.</p>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Supported Platforms</h2>
            <p className="text-xl text-white/40">Connect all your favorite platforms in one place</p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5 max-w-5xl mx-auto">
            <div className="bg-black p-12 text-center group hover:bg-white/[0.02] transition-all">
              <div className="text-4xl font-bold text-white mb-2">YouTube</div>
              <div className="text-sm text-white/30 uppercase tracking-wider">Video Platform</div>
            </div>

            <div className="bg-black p-12 text-center group hover:bg-white/[0.02] transition-all border-x border-white/5">
              <div className="text-4xl font-bold text-white mb-2">TikTok</div>
              <div className="text-sm text-white/30 uppercase tracking-wider">Short Form</div>
            </div>

            <div className="bg-black p-12 text-center group hover:bg-white/[0.02] transition-all">
              <div className="text-4xl font-bold text-white mb-2">Instagram</div>
              <div className="text-sm text-white/30 uppercase tracking-wider">Social Media</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5 py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white tracking-tight leading-tight">
            Ready to grow<br />your audience?
          </h2>
          <p className="text-xl text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
            Start posting to multiple platforms today and save hours every week
          </p>
          <SignInButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/30 text-sm">&copy; 2025 PostWave. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
