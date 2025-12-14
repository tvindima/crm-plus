'use client';

import { useState } from 'react';

type Props = {
  videoUrl?: string | null;
  propertyTitle: string;
};

export function PropertyVideo({ videoUrl, propertyTitle }: Props) {
  const [showVideo, setShowVideo] = useState(false);

  if (!videoUrl) {
    return null;
  }

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1`
    : videoUrl;

  return (
    <>
      <button
        onClick={() => setShowVideo(true)}
        className="flex items-center gap-2 rounded-xl bg-[#0B0B0D]/70 px-4 py-3 text-sm font-semibold text-white ring-1 ring-[#1F1F22] transition hover:ring-[#E10600]"
      >
        <svg className="h-5 w-5 text-[#E10600]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        Ver vídeo do imóvel
      </button>

      {showVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setShowVideo(false)}
        >
          <button
            onClick={() => setShowVideo(false)}
            className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative aspect-video w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {youtubeId ? (
              <iframe
                src={embedUrl}
                title={`Vídeo do imóvel: ${propertyTitle}`}
                className="h-full w-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="h-full w-full rounded-xl"
              >
                O seu browser não suporta vídeo.
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
}
