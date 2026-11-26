import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

// Placeholder wordmark. Swap this for your own logo asset, e.g.
//   import logo from './assets/logo.svg'
//   <img src={logo} alt="Logo" className="logo w-[min(70vw,520px)]" />
function Logo() {
  return (
    <h1 className="logo select-none font-display text-[clamp(64px,14vw,180px)] font-black uppercase leading-none tracking-tight">
      Your Logo
    </h1>
  )
}

export default function App() {
  const root = useRef(null)

  useGSAP(
    () => {
      gsap.from('.logo', {
        opacity: 0,
        y: 24,
        scale: 0.96,
        duration: 1.2,
        ease: 'power3.out',
      })
    },
    { scope: root },
  )

  return (
    <main
      ref={root}
      className="flex min-h-screen items-center justify-center bg-bg px-6"
    >
      <Logo />
    </main>
  )
}
