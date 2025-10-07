'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Video = {
  id: string
  title: string
  file_name: string
}

type PostToYouTubeModalProps = {
  video: Video
  onClose: () => void
}

export default function PostToYouTubeModal({ video, onClose }: PostToYouTubeModalProps) {
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [posting, setPosting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: video.id,
          platforms: [
            {
              platform: 'youtube',
              title,
              description,
              tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            },
          ],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const post = data.posts[0]

        if (post.status === 'published') {
          alert(`Video posted to YouTube successfully!\n\nView at: ${post.platform_url}`)
          router.refresh()
          onClose()
        } else if (post.status === 'failed') {
          alert(`Failed to post to YouTube: ${post.error_message}`)
        } else {
          alert('Video is being processed...')
          router.refresh()
          onClose()
        }
      } else {
        const error = await response.json()
        alert(`Failed to post: ${error.error}`)
      }
    } catch (error) {
      console.error('Post error:', error)
      alert('Failed to post video. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Post to YouTube</h2>
              <p className="text-sm text-slate-400">{video.file_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={posting}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Enter video title"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/100 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter video description (optional)"
            />
            <p className="text-xs text-slate-500 mt-1">{description.length}/5000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={posting}
              className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={posting || !title}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {posting ? 'Posting...' : 'Post to YouTube'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
