import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import loaderSvg from '/assets/brand/loader-logo.svg?raw'

// Our wordmark outline, taken from the loader SVG's own path
const viewBox = /viewBox="([^"]+)"/.exec(loaderSvg)?.[1]
const pathD = /<path[^>]*\sd="([^"]+)"/.exec(loaderSvg)?.[1]
const [vx, vy, vw, vh] = viewBox.split(/\s+/).map(Number)

// Reference loader (01-hero-intro.mp4): a thin outline that sits faint, then a bright highlight
// sweeps along it from the top-left corner, down the left side, across the bottom to the far
// bottom-right (about 0.65s), leaving the whole outline lit; it then dims slowly and fades out.
// Times below are seconds after the loader starts; measured from the recording at 30fps.
const BAND = 0.3 // half-width of the highlight, as a fraction of the diagonal

export default function Loader({ ready, onDone }) {
  const root = useRef(null)
  const base = useRef(null)
  const shine = useRef(null)
  const grad = useRef(null)
  const loop = useRef(null)
  const [gone, setGone] = useState(false)

  // Move the highlight band along the diagonal: c = band centre, 0 = top-left, 1 = bottom-right
  const place = (c) => {
    const g = grad.current
    if (!g) return
    g.setAttribute('x1', vx + vw * (c - BAND))
    g.setAttribute('y1', vy + vh * (c - BAND))
    g.setAttribute('x2', vx + vw * (c + BAND))
    g.setAttribute('y2', vy + vh * (c + BAND))
  }

  // Idle loop while assets load
  useGSAP(() => {
    const pos = { c: -BAND }
    place(pos.c)
    gsap.set(base.current, { strokeOpacity: 0.09 })
    gsap.set(shine.current, { opacity: 0 })
    loop.current = gsap
      .timeline({ repeat: -1, repeatDelay: 0.4 })
      // highlight sweeps top-left -> bottom-right
      .set(shine.current, { opacity: 1 }, 0.55)
      .fromTo(pos, { c: -BAND }, { c: 1 + BAND, duration: 0.75, ease: 'sine.inOut', onUpdate: () => place(pos.c) }, 0.55)
      .set(shine.current, { opacity: 0 }, 1.3)
      // outline stays lit after the highlight has passed, then dims slowly
      .to(base.current, { strokeOpacity: 0.32, duration: 0.6, ease: 'power1.out' }, 0.7)
      .to(base.current, { strokeOpacity: 0.14, duration: 1.3, ease: 'power2.out' }, 1.4)
      .to(base.current, { strokeOpacity: 0.09, duration: 0.6 }, 2.7)
  })

  // Exit: outline fades, then the whole screen fades. onDone fires when it is completely gone.
  useGSAP(
    () => {
      if (!ready) return
      loop.current?.kill()
      gsap
        .timeline({
          onComplete: () => {
            setGone(true)
            onDone?.() // loader completely gone: the intro may start
          },
        })
        .to([base.current, shine.current], { opacity: 0, strokeOpacity: 0, duration: 0.3, ease: 'power1.out' })
        .to(root.current, { autoAlpha: 0, duration: 0.5, ease: 'power1.out' }, 0.5)
    },
    { dependencies: [ready] },
  )

  if (gone) return null
  return (
    <div ref={root} className="loader" role="status" aria-label="Loading">
      <svg className="loader__mark" viewBox={viewBox} aria-hidden="true">
        <defs>
          <linearGradient id="loaderShine" ref={grad} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c8ceff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#c8ceff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* the dim outline */}
        <path
          ref={base}
          d={pathD}
          fill="none"
          stroke="#fff"
          strokeWidth="1.25"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* the moving highlight, with a soft glow */}
        <path
          ref={shine}
          d={pathD}
          fill="none"
          stroke="url(#loaderShine)"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 4px rgba(170,180,255,.8))' }}
        />
      </svg>
    </div>
  )
}