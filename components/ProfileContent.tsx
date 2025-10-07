'use client'

import { useState } from 'react'
import DeleteAccountButton from './DeleteAccountButton'

interface ProfileContentProps {
  user: {
    email: string
    created_at: string
  }
  profile: {
    full_name: string | null
  } | null
  connections: Array<{
    platform: string
    platform_username: string | null
    is_active: boolean
    connected_at: string
  }> | null
  stats: {
    totalVideos: number
    totalStorage: number
  }
}

export default function ProfileContent({ user, profile, connections, stats }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState('account')

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const tabs = [
    { id: 'account', name: 'Account', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'privacy', name: 'Privacy & Security', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
    { id: 'platforms', name: 'Connected Platforms', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )},
    { id: 'danger', name: 'Account Management', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  ]

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4 sticky top-24">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-600/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8">
        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-8">
            {/* Profile Info */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Profile Information</h3>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-3xl font-bold flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">{profile?.full_name || 'User'}</h4>
                  <p className="text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm text-slate-400 font-medium">Email</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-slate-400 font-medium">Member Since</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white">
                    {formatDate(user.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">Total Videos</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">Connected Platforms</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{connections?.length || 0}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">Storage Used</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatFileSize(stats.totalStorage)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Privacy & Security</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-slate-800">
                <div>
                  <h4 className="text-white font-semibold">Two-Factor Authentication</h4>
                  <p className="text-sm text-slate-400 mt-1">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-slate-800">
                <div>
                  <h4 className="text-white font-semibold">Email Notifications</h4>
                  <p className="text-sm text-slate-400 mt-1">Receive updates about your uploads and posts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="text-white font-semibold">Data Export</h4>
                  <p className="text-sm text-slate-400 mt-1">Download a copy of your data</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                  Request Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connected Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Connected Platforms</h3>

            {connections && connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div
                    key={connection.platform}
                    className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-4">
                      {connection.platform === 'youtube' && (
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-lg capitalize">{connection.platform}</p>
                        <p className="text-sm text-slate-400">
                          {connection.platform_username || 'Connected'} • Connected {formatDate(connection.connected_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-sm text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-slate-400">No platforms connected yet</p>
                <p className="text-sm text-slate-500 mt-2">Connect platforms from your dashboard</p>
              </div>
            )}
          </div>
        )}

        {/* Account Management Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-8">
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Account Management</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-white font-semibold">Download Your Data</h4>
                    <p className="text-sm text-slate-400 mt-1">Request a copy of all your videos and account data</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                    Request
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-white font-semibold">Deactivate Account</h4>
                    <p className="text-sm text-slate-400 mt-1">Temporarily disable your account</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-400 mb-2">Delete Account Permanently</h3>
                  <p className="text-slate-300 mb-6">
                    Once you delete your account, there is no going back. All your videos, connections, and data will be permanently removed from our servers.
                  </p>
                  <DeleteAccountButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
