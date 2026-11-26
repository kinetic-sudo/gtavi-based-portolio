import { useEffect, useState } from 'react'

const files = import.meta.glob('../assets/site/hero/**/*.avif', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const SHARDS = Array.from({ length: 10 }, (_, i) => `shard-${String(i + 1).padStart(2, '0')}`)
export const heroUrl = (set, name) => files[`../assets/site/hero/${set}/${name}.avif`]
export const heroUrls = (set) =>
  ['poster', 'poster-logo', 'logo-vi', 'logo-gta', ...SHARDS].map((n) => heroUrl(set, n))

const MOBILE_Q = '(max-width: 1023px), (max-aspect-ratio: 1/1)'
export function useIsMobile() {
  const [m, setM] = useState(() => window.matchMedia(MOBILE_Q).matches)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_Q)
    const on = (e) => setM(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

const FONTS = [
  "700 16px 'Barlow Condensed'",
  "900 16px 'Barlow Condensed'",
  "400 16px 'Outfit'",
  "500 16px 'Outfit'",
]
const MIN_MS = 500 // never a flash: loader stays at least this long
const MAX_MS = 15000 // failsafe if something never loads

// Resolves `ready` once fonts + images have loaded (and decoded).
export function useAssetsReady(urls) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const total = urls.length + FONTS.length
    let done = 0
    const tick = () => {
      done += 1
      if (!cancelled) setProgress(done / total)
    }
    const img = (src) =>
      new Promise((res) => {
        const i = new Image()
        i.src = src
        const ok = () => {
          tick()
          res()
        }
        i.decode ? i.decode().then(ok, ok) : ((i.onload = ok), (i.onerror = ok))
      })
    const font = (f) => document.fonts.load(f).then(tick, tick)
    const wait = (ms) => new Promise((r) => setTimeout(r, ms))

    const all = Promise.all([...urls.map(img), ...FONTS.map(font)]).then(() => document.fonts.ready)
    Promise.all([Promise.race([all, wait(MAX_MS)]), wait(MIN_MS)]).then(() => {
      if (!cancelled) {
        setProgress(1)
        setReady(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [urls])

  return { progress, ready }
}
