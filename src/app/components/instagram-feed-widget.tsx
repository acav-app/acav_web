'use client'

import { useEffect, useRef } from 'react'

const EMBED_ID = '25725997'
const WIDGET_SCRIPT_URL = 'https://widgets.sociablekit.com/instagram-feed/widget.js'

export default function InstagramFeedWidget() {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const widget = widgetRef.current
    if (!widget) return

    const script = document.createElement('script')
    script.src = WIDGET_SCRIPT_URL
    script.async = true
    widget.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return (
    <div
      ref={widgetRef}
      className="w-full min-w-0"
      role="region"
      aria-label="Publicaciones recientes de ACAV en Instagram"
    >
      <div className="sk-instagram-feed" data-embed-id={EMBED_ID} />
      <noscript>
        <a href="https://www.instagram.com/acavoficial/">Ver las publicaciones de ACAV en Instagram</a>
      </noscript>
    </div>
  )
}
