'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SignOutButtonProps {
  variant?: 'default' | 'menu'
}

export default function SignOutButton({ variant = 'default' }: SignOutButtonProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (variant === 'menu') {
    return (
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      className="bg-slate-800 text-slate-200 px-6 py-2 rounded-lg font-medium hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer"
    >
      Sign Out
    </button>
  )
}
