import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { hero, LINKS } from '../content'

const files = import.meta.glob('/assets/site/hero/**/*.avif', {
  eager: true,
  query: '?url',
  import: 'default',
})
const url = (set, name) => files[`/assets/site/hero/${set}/${name}.avif`]
const SHARDS = Array.from({ length: 10 }, (_, i) => `shard-${String(i + 1).padStart(2, '0')}`)

function useIsMobile() {
  const q = '(max-width: 1023px), (max-aspect-ratio: 1/1)'
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = (e) => setM(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

export default function Hero() {
  const root = useRef(null)
  const set = useIsMobile() ? 'mobile' : 'desktop'

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const done = () => {
        // Swap to the poster (the intro's last frame) so nothing flickers
        gsap.set('.hero__poster, .hero__poster-logo', { autoAlpha: 1 })
        gsap.set('.hero__shard, .hero__vi, .hero__gta', { autoAlpha: 0 })
      }
      if (reduce) {
        gsap.set('.hero__ui', { autoAlpha: 1 })
        return done()
      }

      // Timings below are first-pass estimates read from the intro recording
      // (src/references): ~0.6s dark, collage converges ~0.6s, VI layer, then title, then UI.
      // Not yet measured against the live site: see AGENTS.md "Open differences".
      const tl = gsap.timeline({ delay: 0.6, onComplete: done })
      tl.fromTo(
        '.hero__shard',
        {
          autoAlpha: 0,
          scale: 1.18,
          rotate: (i) => (i % 2 ? 4 : -4),
          x: (i) => (i % 3 - 1) * 60,
          y: (i) => (i % 2 ? 40 : -40),
        },
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          x: 0,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.04,
        },
      )
        .fromTo('.hero__vi', { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .fromTo('.hero__gta', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1')
        .fromTo('.hero__ui', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, '-=0.1')
    },
    { scope: root, dependencies: [set] },
  )

  return (
    <section id="top" ref={root} className="hero">
      <div className="hero__canvas">
        <img className="hero__layer hero__poster" src={url(set, 'poster')} alt="" />
        {SHARDS.map((s) => (
          <img key={s} className="hero__layer hero__shard" src={url(set, s)} alt="" />
        ))}
        <img className="hero__layer hero__vi" src={url(set, 'logo-vi')} alt="" />
        <img className="hero__layer hero__gta" src={url(set, 'logo-gta')} alt="" />
        <img className="hero__layer hero__poster-logo" src={url(set, 'poster-logo')} alt="Grand Theft Developer" />
      </div>

      <div className="hero__bar">
        <p className="hero__ui hero__tagline">
          {hero.tagline.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
        <a href={LINKS.hire} className="hero__ui hero__button">
          {hero.button}
        </a>
        <ul className="hero__ui hero__tags">
          {hero.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <p className="hero__ui hero__disclaimer">{hero.disclaimer}</p>
    </section>
  )
}
