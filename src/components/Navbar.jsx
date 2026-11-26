import { useEffect, useState } from 'react'
import { navbar, LINKS } from '../content'

export default function Navbar() {
  const [showPill, setShowPill] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setShowPill(!e.isIntersecting), {
      rootMargin: '-60% 0px 0px 0px',
    })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <header className={`navbar${showPill ? ' navbar--pill' : ''}`}>
      <a href="#top" className="navbar__mono" aria-label="Back to top">
        {navbar.monogram}
      </a>
      <div className="navbar__right">
        <a href={LINKS.hire} className="navbar__pill" tabIndex={showPill ? 0 : -1}>
          {navbar.pill}
        </a>
        <button type="button" className="navbar__menu" aria-label={navbar.menuLabel}>
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
