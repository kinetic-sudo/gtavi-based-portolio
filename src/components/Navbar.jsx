import { navbar, LINKS } from '../content'

export default function Navbar() {
  return (
    <header className="navbar">
      <a href="#top" className="navbar__mono" aria-label="Back to top">
        {navbar.monogram}
      </a>
      <div className="navbar__right">
        <a href={LINKS.hire} className="navbar__pill">
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
