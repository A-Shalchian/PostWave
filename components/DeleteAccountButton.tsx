'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Toast from './Toast'

export default function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [confirmText, setConfirmText] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/account/delete')
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch account summary:', error)
    }
  }

  const handleDeleteClick = () => {
    fetchSummary()
    setConfirmText('')
    setShowModal(true)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
      })

      if (response.ok) {
        setShowModal(false)
        setToast({ message: 'Your account has been deleted successfully.', type: 'success' })
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
      } else {
        const error = await response.json()
        setShowModal(false)
        setToast({ message: `Failed to delete account: ${error.error}`, type: 'error' })
      }
    } catch (error) {
      console.error('Delete account error:', error)
      setShowModal(false)
      setToast({ message: 'Failed to delete account. Please try again.', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={handleDeleteClick}
        className="w-full bg-red-900/30 text-red-400 py-3 rounded-lg font-medium hover:bg-red-900/50 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer border border-red-800/50"
      >
        Delete Account
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-800/50 rounded-2xl max-w-md w-full">
            <div className="bg-red-900/20 border-b border-red-800/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Account</h2>
                  <p className="text-sm text-red-400">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-slate-300">
                Deleting your account will permanently remove:
              </p>

              {summary && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Videos:</span>
                    <span className="text-white font-medium">{summary.video_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connected Accounts:</span>
                    <span className="text-white font-medium">{summary.connection_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Posts:</span>
                    <span className="text-white font-medium">{summary.post_count || 0}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2 mt-2">
                    <span className="text-slate-400">Total Storage:</span>
                    <span className="text-white font-medium">{formatBytes(summary.total_storage_bytes || 0)}</span>
                  </div>
                </div>
              )}

              <div className="bg-red-900/10 border border-red-800/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">
                  ⚠️ All your videos, posts, and connected accounts will be permanently deleted. This action cannot be reversed.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-slate-300 text-sm font-medium">
                    Type <span className="text-red-400 font-bold">DELETE ACCOUNT</span> to confirm:
                  </span>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE ACCOUNT"
                    disabled={deleting}
                    className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={deleting}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting || confirmText !== 'DELETE ACCOUNT'}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {deleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
