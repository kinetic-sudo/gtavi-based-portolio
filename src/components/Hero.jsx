import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { hero, LINKS } from '../content'
import { SHARDS, heroUrl, useIsMobile } from '../lib/heroAssets'

gsap.registerPlugin(useGSAP)

// Intro timing (seconds after `play` starts, i.e. when the loader begins to fade)
// read frame by frame from src/references/01-hero-intro.mp4 at ~30fps plus key frames:
//   shards fly in from +0.3, VI from +0.65, title wipe from +1.25, UI from +1.75,
//   whole collage brightens until ~+2.5. Easing is fitted by eye to the motion curve.
// Not yet diffed against the live site (see AGENTS.md "Open differences").
export default function Hero({ play }) {
  const root = useRef(null)
  const set = useIsMobile() ? 'mobile' : 'desktop'

  useGSAP(
    () => {
      if (!play) return
      const html = document.documentElement
      // Respect the OS "Reduce motion" setting (AGENTS.md). Add ?motion=1 to the URL to force
      // the full intro anyway, e.g. when testing on a Mac that has Reduce motion switched on.
      const forced = /[?&]motion=1/.test(window.location.search)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !forced
      if (import.meta.env.DEV) console.info('[hero] intro', { reduce, forced })
      const finish = () => {
        // Swap to the poster (the intro's last frame) so nothing flickers
        gsap.set('.hero__poster, .hero__poster-logo', { autoAlpha: 1 })
        gsap.set('.hero__shard, .hero__vi, .hero__gta', { autoAlpha: 0 })
        gsap.set('.hero__canvas', { clearProps: 'filter' })
      }
      if (reduce) {
        html.classList.add('ui-in')
        gsap.set('.hero__ui', { autoAlpha: 1 })
        return finish()
      }

      const tl = gsap.timeline({ onComplete: finish })

      // 1. Pieces fly in: huge, tilted in 3D, settling with a long ease-out
      const sign = (i) => (i % 2 ? 1 : -1)
      tl.fromTo(
        '.hero__shard',
        {
          scale: 2.2,
          rotationZ: (i) => sign(i) * (5 + (i % 3) * 2),
          rotationX: (i) => sign(i + 1) * 22,
          rotationY: (i) => sign(i) * 18,
          xPercent: (i) => ((i % 4) - 1.5) * 12,
          yPercent: (i) => ((i % 3) - 1) * 14,
          transformPerspective: 1400,
        },
        {
          scale: 1,
          rotationZ: 0,
          rotationX: 0,
          rotationY: 0,
          xPercent: 0,
          yPercent: 0,
          duration: 1.5,
          ease: 'power4.out',
          stagger: 0.05,
        },
        0.3,
      )
      tl.fromTo(
        '.hero__shard',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6, ease: 'power1.out', stagger: 0.05 },
        0.3,
      )

      // 2. Collage brightens slowly while everything else lands
      tl.fromTo(
        '.hero__canvas',
        { filter: 'brightness(0.78)' },
        { filter: 'brightness(1)', duration: 1.9, ease: 'power1.out' },
        0.8,
      )

      // 3. VI mark
      tl.fromTo('.hero__vi', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' }, 0.65)

      // 4. Title: wipes in top to bottom
      tl.fromTo(
        '.hero__gta',
        { autoAlpha: 0, clipPath: 'inset(0% 0% 64% 0%)' },
        { autoAlpha: 1, clipPath: 'inset(0% 0% 20% 0%)', duration: 0.6, ease: 'power1.inOut' },
        1.15,
      )

      // 5. Navbar + bottom row fade up
      tl.call(() => html.classList.add('ui-in'), null, 1.75)
      tl.fromTo('.hero__ui', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 1.75)
    },
    { scope: root, dependencies: [set, play] },
  )

  return (
    <section id="top" ref={root} className="hero">
      <div className="hero__canvas">
        <img className="hero__layer hero__poster" src={heroUrl(set, 'poster')} alt="" />
        {SHARDS.map((s) => (
          <img key={s} className="hero__layer hero__shard" src={heroUrl(set, s)} alt="" />
        ))}
        <img className="hero__layer hero__vi" src={heroUrl(set, 'logo-vi')} alt="" />
        <img className="hero__layer hero__gta" src={heroUrl(set, 'logo-gta')} alt="" />
        <img
          className="hero__layer hero__poster-logo"
          src={heroUrl(set, 'poster-logo')}
          alt="Grand Theft Developer"
        />
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
