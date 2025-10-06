'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConnectButtonProps {
  platform: 'youtube' | 'tiktok' | 'instagram'
  isConnected: boolean
  className?: string
}

export default function ConnectButton({ platform, isConnected, className }: ConnectButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    // Redirect to OAuth flow
    window.location.href = `/api/${platform}/connect`
  }

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${platform}/disconnect`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert(`Failed to disconnect ${platform}`)
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      alert(`Failed to disconnect ${platform}`)
    } finally {
      setLoading(false)
    }
  }

  if (isConnected) {
    return (
      <button
        onClick={handleDisconnect}
        disabled={loading}
        className="w-full bg-slate-800 text-slate-300 py-3 rounded-lg hover:bg-slate-700 transition-all duration-300 ease-out font-medium hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
      >
        {loading ? 'Disconnecting...' : 'Disconnect'}
      </button>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Connecting...' : 'Connect'}
    </button>
  )
}
