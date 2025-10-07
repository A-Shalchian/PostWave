

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import DownloadButton from '@/components/DownloadButton'

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard')
  }

  // Get video details
  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !video) {
    redirect('/dashboard')
  }

  // Get signed URL for video
  const { data: urlData } = await supabase.storage
    .from('videos')
    .createSignedUrl(video.file_path, 3600) // 1 hour expiry

  if (!urlData?.signedUrl) {
    redirect('/dashboard')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <VideoPlayer videoUrl={urlData.signedUrl} videoTitle={video.title} />
          </div>

          {/* Video Info */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{video.title}</h2>

              {video.description && (
                <div className="mb-6">
                  <p className="text-slate-300 text-sm leading-relaxed">{video.description}</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">File Name</span>
                  <span className="text-white font-medium truncate ml-4">{video.file_name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">File Size</span>
                  <span className="text-white font-medium">{formatFileSize(video.file_size)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-medium uppercase">{video.mime_type.split('/')[1]}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    video.status === 'ready'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {video.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400">Uploaded</span>
                  <span className="text-white font-medium">{formatDate(video.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer text-center"
                >
                  Post to YouTube
                </Link>
                <DownloadButton videoUrl={urlData.signedUrl} fileName={video.file_name} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
