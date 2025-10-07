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
      className="w-full bg-slate-800 text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-700 transition-all duration-300 ease-out hover:scale-105 active:scale-95 cursor-pointer border border-slate-700"
    >
      Download Video
    </button>
  )
}
