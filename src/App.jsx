import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Loader from './components/Loader'
import { heroUrls, useIsMobile, useAssetsReady } from './lib/heroAssets'

export default function App() {
  const mobile = useIsMobile()
  const urls = useMemo(() => heroUrls(mobile ? 'mobile' : 'desktop'), [mobile])
  const { ready } = useAssetsReady(urls)
  // Order: loader -> pieces fly in -> VI -> wordmark -> page UI.
  // The loader reports when it is completely gone; only then does the intro start.
  const [play, setPlay] = useState(false)

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
      <Loader ready={ready} onDone={() => setPlay(true)} />
    </>
  )
}