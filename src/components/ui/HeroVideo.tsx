'use client'

import { useEffect, useRef } from 'react'

interface Props {
  src: string
}

// Loads the video source only after JS hydration so it never blocks FCP/LCP.
// Cleans up on unmount to avoid blocking the back/forward cache.
export default function HeroVideo({ src }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.src = src
    video.play().catch(() => {})

    return () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [src])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-[1200ms]"
      onCanPlay={(e) => {
        ;(e.currentTarget as HTMLVideoElement).style.opacity = '1'
      }}
    />
  )
}
