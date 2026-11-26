import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import loaderSvg from '/assets/brand/loader-logo.svg?raw'

// Our wordmark outline, taken from the loader SVG's own path
const viewBox = /viewBox="([^"]+)"/.exec(loaderSvg)?.[1]
const pathD = /<path[^>]*\sd="([^"]+)"/.exec(loaderSvg)?.[1]

// Pulse and exit timing read from the reference recording (01-hero-intro.mp4):
//   faint outline ~0.5s, brightens over ~0.25s, brief hold, decays over ~1.4s to a faint tail;
//   on exit the outline fades in ~0.3s, then the screen fades as the intro starts (+0.5s).
export default function Loader({ ready }) {
  const root = useRef(null)
  const mark = useRef(null)
  const pulse = useRef(null)
  const [gone, setGone] = useState(false)

  // Idle pulse while assets load
  useGSAP(() => {
    const p = mark.current
    gsap.set(p, { strokeOpacity: 0.04 })
    pulse.current = gsap
      .timeline({ repeat: -1, repeatDelay: 1.2 })
      .to(p, { strokeOpacity: 0.04, duration: 0.55 })
      .to(p, { strokeOpacity: 0.26, duration: 0.25, ease: 'power2.out' })
      .to(p, { strokeOpacity: 0.26, duration: 0.3 })
      .to(p, { strokeOpacity: 0.05, duration: 1.4, ease: 'expo.out' })
      .to(p, { strokeOpacity: 0.035, duration: 0.5 })
  })

  // Exit: outline fades, then the whole screen fades while the intro plays behind
  useGSAP(
    () => {
      if (!ready) return
      pulse.current?.kill()
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(mark.current, { strokeOpacity: 0, duration: 0.3, ease: 'power1.out' })
        .to(root.current, { autoAlpha: 0, duration: 0.5, ease: 'power1.out' }, 0.5)
    },
    { dependencies: [ready] },
  )

  if (gone) return null
  return (
    <div ref={root} className="loader" role="status" aria-label="Loading">
      <svg className="loader__mark" viewBox={viewBox} aria-hidden="true">
        <path
          ref={mark}
          d={pathD}
          fill="none"
          stroke="#fff"
          strokeWidth="1.25"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
