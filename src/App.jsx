import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import logo from '/assets/brand/logo-poster.png'

gsap.registerPlugin(useGSAP)

function Logo() {
  return (
    <img
      src={logo}
      alt="Grand Theft Developer"
      width="1448"
      height="1086"
      className="logo w-[min(80vw,560px)] select-none"
      draggable="false"
    />
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
