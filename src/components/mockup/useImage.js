import { useState, useEffect } from 'react'

export default function useImage(src) {
  const [image, setImage] = useState(null)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!src) { setImage(null); setStatus('idle'); return }
    setStatus('loading')
    const img = new window.Image()
    img.onload = () => { setImage(img); setStatus('loaded') }
    img.onerror = () => { setImage(null); setStatus('error') }
    img.src = src
  }, [src])

  return [image, status]
}
