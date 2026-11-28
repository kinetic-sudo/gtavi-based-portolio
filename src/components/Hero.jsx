import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { hero, LINKS } from '../content'
import { SHARDS, heroUrl, useIsMobile } from '../lib/heroAssets'

gsap.registerPlugin(useGSAP)

// Intro timing (seconds after `play` starts, i.e. when the loader begins to fade)
// read frame by frame from src/references/01-hero-intro.mp4 at ~30fps plus key frames:
// See the timeline below for the numbers. Not yet diffed against the target (AGENTS.md).
export default function Hero({ play }) {
  const root = useRef(null)
  const set = useIsMobile() ? 'mobile' : 'desktop'

  useGSAP(
    () => {
      if (!play) return
      const html = document.documentElement
      // Visitors with the OS "Reduce motion" setting get the static poster (AGENTS.md).
      // In dev (npm run dev) the full intro always plays, so a developer machine with Reduce
      // motion switched on still sees it. ?motion=1 forces it in a production build too.
      const osReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const forced = import.meta.env.DEV || /[?&]motion=1/.test(window.location.search)
      const reduce = osReduce && !forced
      if (import.meta.env.DEV) {
        console.info('[hero] intro playing', { osReduceMotion: osReduce, reduce })
        if (osReduce) console.warn('[hero] OS "Reduce motion" is ON: production builds will show the static poster instead of the intro.')
      }
      const finish = () => {
        // Swap to the poster (the intro's last frame). The poster is shown first and the
        // animated layers are hidden two frames later, so the swap can never flash.
        gsap.set('.hero__poster, .hero__poster-logo', { autoAlpha: 1 })
        gsap.set('.hero__canvas', { clearProps: 'filter' })
        requestAnimationFrame(() =>
          requestAnimationFrame(() => gsap.set('.hero__shard, .hero__vi, .hero__gta', { autoAlpha: 0 })),
        )
      }
      if (reduce) {
        html.classList.add('ui-in')
        gsap.set('.hero__ui', { autoAlpha: 1 })
        return finish()
      }

      const tl = gsap.timeline({ onComplete: finish })

      // Order: pieces fly in -> VI -> wordmark -> page UI (loader has already finished).
      // Timings read frame by frame from the target video (30fps sheets), t=0 is when
      // `play` starts (loader gone); pieces first appear at +0.3 (video 2.68s):
      //   pieces: start ~2.3x too big, dim and tilted, each shrinks to size in ~0.6s;
      //   the dark centre must not linger, so the VI mark starts while the last pieces land:
      //   VI +0.6..0.9 (done before the wordmark starts), wordmark wipes in +0.9..1.35, page UI +1.4..1.9;
      //   whole collage brightens from ~0.45 to 1 over ~1.8s.

      // 1. Individual pieces fly in and lock together. Right-centre pieces land first.
      const sign = (i) => (i % 2 ? 1 : -1)
      tl.fromTo(
        '.hero__shard',
        {
          scale: 2.3,
          rotationZ: (i) => sign(i) * (3 + (i % 3) * 1.5),
          rotationX: (i) => sign(i + 1) * 14,
          rotationY: (i) => sign(i) * 12,
          transformPerspective: 1400,
        },
        {
          scale: 1,
          rotationZ: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.6,
          ease: 'sine.out',
          stagger: { each: 0.015, from: 'random' },
        },
        0.3,
      )
      tl.fromTo(
        '.hero__shard',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: 'power1.out', stagger: { each: 0.015, from: 'random' } },
        0.3,
      )

      // 2. Whole collage starts dim and brightens slowly
      tl.fromTo(
        '.hero__canvas',
        { filter: 'brightness(0.45)' },
        { filter: 'brightness(1)', duration: 1.8, ease: 'sine.inOut' },
        0.3,
      )

      // 3. VI mark
      tl.fromTo('.hero__vi', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' }, 0.6)

      // 4. Title: wipes in top to bottom, line by line
      tl.fromTo(
        '.hero__gta',
        { autoAlpha: 0, clipPath: 'inset(0% 0% 64% 0%)' },
        { autoAlpha: 1, clipPath: 'inset(0% 0% 20% 0%)', duration: 0.45, ease: 'none' },
        0.9,
      )

      // 5. Navbar + bottom row fade up last
      tl.call(() => html.classList.add('ui-in'), null, 1.4)
      tl.fromTo('.hero__ui', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 1.4)
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
        <p className="hero__ui hero__tagline" style={{ visibility: 'hidden' }}>
          {hero.tagline.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
        <a href={LINKS.hire} className="hero__ui hero__button" style={{ visibility: 'hidden' }}>
          {hero.button}
        </a>
        <ul className="hero__ui hero__tags" style={{ visibility: 'hidden' }}>
          {hero.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <p className="hero__ui hero__disclaimer" style={{ visibility: 'hidden' }}>{hero.disclaimer}</p>
    </section>
  )
}