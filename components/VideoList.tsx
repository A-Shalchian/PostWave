'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostToYouTubeModal from './PostToYouTubeModal'

type Video = {
  id: string
  title: string
  file_name: string
  file_size: number
  created_at: string
  status: string
}

type VideoListProps = {
  videos: Video[]
  hasYouTubeConnection: boolean
}

export default function VideoList({ videos, hasYouTubeConnection }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePostClick = (video: Video) => {
    if (!hasYouTubeConnection) {
      alert('Please connect your YouTube account first!')
      return
    }
    setSelectedVideo(video)
    setShowPostModal(true)
  }

  if (videos.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-400 text-lg">No videos uploaded yet</p>
        <p className="text-slate-500 text-sm mt-2">Upload your first video to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
        <h3 className="text-2xl font-semibold mb-2 text-white">Your Videos</h3>
        <p className="text-slate-300 mb-6">
          Manage and post your uploaded videos
        </p>

        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/player/${video.id}`}
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 relative">
                    <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-lg transition-colors" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-sm text-slate-400 mb-2 truncate">
                      {video.file_name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{formatFileSize(video.file_size)}</span>
                      <span>•</span>
                      <span>{formatDate(video.created_at)}</span>
                      <span>•</span>
                      <span className="text-cyan-400">Click to preview</span>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => handlePostClick(video)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer whitespace-nowrap"
                >
                  Post to YouTube
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPostModal && selectedVideo && (
        <PostToYouTubeModal
          video={selectedVideo}
          onClose={() => {
            setShowPostModal(false)
            setSelectedVideo(null)
          }}
        />
      )}
    </>
  )
}
