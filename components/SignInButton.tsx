'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignInButton() {
  const supabase = createClient()

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 ease-out shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
    >
      Sign in with Google
    </button>
  )
}
