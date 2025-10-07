'use client'

type DownloadButtonProps = {
  videoUrl: string
  fileName: string
}

export default function DownloadButton({ videoUrl, fileName }: DownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = fileName
    link.click()
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 hover:text-white transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 cursor-pointer border border-slate-700"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download Video
    </button>
  )
}
