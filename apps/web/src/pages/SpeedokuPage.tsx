import { Link } from "react-router-dom"
import { SPEEDOKU_POC_URL } from "../config/projects.ts"
import doc from "./ResumePage.module.css"
import styles from "./SpeedokuPage.module.css"

function PixelChevron() {
  return (
    <svg
      className={doc.chevron}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect x="10" y="1" width="3" height="2" fill="currentColor" />
      <rect x="8" y="3" width="3" height="2" fill="currentColor" />
      <rect x="6" y="5" width="3" height="2" fill="currentColor" />
      <rect x="4" y="7" width="3" height="2" fill="currentColor" />
      <rect x="6" y="9" width="3" height="2" fill="currentColor" />
      <rect x="8" y="11" width="3" height="2" fill="currentColor" />
      <rect x="10" y="13" width="3" height="2" fill="currentColor" />
    </svg>
  )
}

export function SpeedokuPage() {
  return (
    <div className={doc.shell}>
      <div className={doc.page} data-frame="">
        <header className={doc.header}>
          <Link to="/" className={doc.back} aria-label="Back to home">
            <PixelChevron />
          </Link>
          <h1 className={`${doc.title} ${styles.title}`}>speedoku</h1>
        </header>
        <main className={doc.content}>
          <p className={styles.hello}>Hello world</p>
          <div className={styles.ctaWrap}>
            <a
              className={styles.cta}
              href={SPEEDOKU_POC_URL}
              target="_blank"
              rel="noreferrer"
            >
              Take me to speedoku!
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
