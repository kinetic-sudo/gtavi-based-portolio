import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import loaderLogo from '/assets/brand/loader-logo.svg'

// Covers the page until fonts + images are ready, then fades out
// while the hero intro plays behind it.
export default function Loader({ progress, ready }) {
  const root = useRef(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      if (!ready) return
      gsap.to(root.current, {
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power1.out',
        onComplete: () => setGone(true),
      })
    },
    { dependencies: [ready] },
  )

  if (gone) return null
  const mask = { maskImage: `url(${loaderLogo})`, WebkitMaskImage: `url(${loaderLogo})` }
  return (
    <div ref={root} className="loader" role="status" aria-label="Loading">
      <div className="loader__shape" style={mask}>
        <div
          className="loader__fill"
          style={{ clipPath: `inset(${(1 - progress) * 100}% 0 0 0)` }}
        />
      </div>
    </div>
  )
}
