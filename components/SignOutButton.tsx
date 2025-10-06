'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
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
