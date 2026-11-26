import { useEffect, useMemo } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Loader from './components/Loader'
import { heroUrls, useIsMobile, useAssetsReady } from './lib/heroAssets'

export default function App() {
  const mobile = useIsMobile()
  const urls = useMemo(() => heroUrls(mobile ? 'mobile' : 'desktop'), [mobile])
  const { progress, ready } = useAssetsReady(urls)

  // No scrolling while the loader is up
  useEffect(() => {
    document.body.style.overflow = ready ? '' : 'hidden'
  }, [ready])

  return (
    <>
      <Navbar />
      <main>
        <Hero play={ready} />
      </main>
      <Loader progress={progress} ready={ready} />
    </>
  )
}
