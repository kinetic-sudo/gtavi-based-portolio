import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Loader from './components/Loader'
import { heroUrls, useIsMobile, useAssetsReady } from './lib/heroAssets'

// Reference: the loader's outline fades (~0.3s), then the intro starts ~0.5s after assets are ready
const INTRO_DELAY_MS = 500

export default function App() {
  const mobile = useIsMobile()
  const urls = useMemo(() => heroUrls(mobile ? 'mobile' : 'desktop'), [mobile])
  const { ready } = useAssetsReady(urls)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setPlay(true), INTRO_DELAY_MS)
    return () => clearTimeout(t)
  }, [ready])

  // No scrolling while the loader is up
  useEffect(() => {
    document.body.style.overflow = play ? '' : 'hidden'
  }, [play])

  return (
    <>
      <Navbar />
      <main>
        <Hero play={play} />
      </main>
      <Loader ready={ready} />
    </>
  )
}
