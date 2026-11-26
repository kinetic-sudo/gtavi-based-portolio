import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import logo from '/assets/brand/logo-poster.png'

gsap.registerPlugin(useGSAP)

export default function App() {
  const root = useRef(null)

  useGSAP(
    () => {
      // Scale-in reveal: starts slightly zoomed in and transparent, settles into place
      gsap.fromTo(
        '.logo',
        { autoAlpha: 0, scale: 1.25 },
        { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'expo.out', delay: 0.15 },
      )
    },
    { scope: root },
  )

  return (
    <main ref={root} className="stage">
      <img
        src={logo}
        alt="Grand Theft Developer"
        width="1448"
        height="1086"
        className="logo"
        draggable="false"
      />
    </main>
  )
}
