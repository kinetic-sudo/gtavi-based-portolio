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
      // The animated layers are also the final picture, so there is no swap to a flattened poster:
      // the swap was what made the wordmark vanish and the pieces jump at the end of the intro.
      const showFinal = () => {
        gsap.set('.hero__shard, .hero__vi, .hero__gta', {
          autoAlpha: 1, scale: 1, rotation: 0, clipPath: 'none',
        })
        gsap.set('.hero__veil', { opacity: 0 })
        // release the GPU layers once nothing moves any more
        root.current?.querySelectorAll('.hero__layer').forEach((el) => (el.style.willChange = 'auto'))
      }
      if (reduce) {
        html.classList.add('ui-in')
        gsap.set('.hero__ui', { autoAlpha: 1 })
        return showFinal()
      }

      // Order: pieces fly in -> VI -> wordmark -> page UI. t=0 is when the loader's screen starts to
      // fade (the intro plays underneath it). Timings read from the target video:
      //   pieces: start ~2.1x too big and slightly tilted, each shrinks to size in ~0.5s (from +0.1);
      //   no 3D rotation (it sheared the tiles into slivers with hard dark edges);
      //   VI (with its dark backing) snaps in at +0.65 once the pieces are down; the wordmark then
      //   appears as three lines, grand / theft / developer, 0.1s apart (+0.68..0.88);
      //   page UI +1.0..1.5; collage brightens from ~0.45 to 1 over ~1.4s via a black veil.
      const sign = (i) => (i % 2 ? 1 : -1)
      const tl = gsap.timeline({ onComplete: showFinal })

      // 1. Individual pieces fly in and lock together
      tl.fromTo(
        '.hero__shard',
        { scale: 2.1, rotation: (i) => sign(i) * (1.5 + (i % 3) * 0.75) },
        {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: 'sine.out',
          force3D: true,
          stagger: { each: 0.008, from: 'random' },
        },
        0.1,
      )
      tl.fromTo(
        '.hero__shard',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power1.out', stagger: { each: 0.008, from: 'random' } },
        0.1,
      )

      // 2. Dim start, brightening slowly (black veil fades out)
      tl.fromTo('.hero__veil', { opacity: 0.55 }, { opacity: 0, duration: 1.4, ease: 'sine.inOut' }, 0.1)

      // 3. VI mark (with its dark backing)
      tl.fromTo('.hero__vi', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: 'none' }, 0.65)

      // 4. Wordmark: three separate lines, cut exactly between the lines of the artwork
      tl.set('.hero__gta', { autoAlpha: 1, clipPath: 'inset(0% 0% 48% 0%)' }, 0.68) // grand
      tl.set('.hero__gta', { clipPath: 'inset(0% 0% 39% 0%)' }, 0.78) // + theft
      tl.set('.hero__gta', { clipPath: 'inset(0% 0% 0% 0%)' }, 0.88) // + developer

      // 5. Navbar + bottom row fade up last
      tl.call(() => html.classList.add('ui-in'), null, 1.0)
      tl.fromTo('.hero__ui', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 1.0)
    },
    { scope: root, dependencies: [set, play] },
  )

  return (
    <section id="top" ref={root} className="hero">
      <div className="hero__canvas" role="img" aria-label="Grand Theft Developer">
        {SHARDS.map((s) => (
          <img key={s} className="hero__layer hero__shard" style={{ willChange: 'transform, opacity' }} src={heroUrl(set, s)} alt="" />
        ))}
        <div
          className="hero__veil"
          style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0, pointerEvents: 'none' }}
        />
        <img className="hero__layer hero__vi" src={heroUrl(set, 'logo-vi')} alt="" />
        <img className="hero__layer hero__gta" style={{ willChange: 'clip-path, opacity' }} src={heroUrl(set, 'logo-gta')} alt="" />
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