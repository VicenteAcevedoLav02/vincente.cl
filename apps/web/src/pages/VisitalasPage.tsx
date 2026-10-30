import { Link } from "react-router-dom"
import { VisitalasMidiPlayer } from "../components/VisitalasMidiPlayer.tsx"
import { VISITALAS_POC_URL } from "../config/projects.ts"
import styles from "./VisitalasPage.module.css"

const ABOUT = [
  "Visitalas.cl is an idea I had in 2025 and now I'm building: this is supposed to be the all-in-one platform to make professional real estate technology accessible to independent brokers and small agencies.",
  "The platform aims to simplify how properties are presented, marketed, and rented online, bringing together AI powered virtual property experiences, professional property pages, visit scheduling, and applicant management in one place.",
  "Our current POC is a frontend mockup demonstrating the early property visualization workflow: brokers can sketch floor plans and attach photos to individual walls.",
  "In parallel, we are privately developing a scalable MVP to bring the broader product vision to life!",
]

export function VisitalasPage() {
  return (
    <div className={styles.shell}>
      <VisitalasMidiPlayer />
      <div className={styles.crt} data-frame="">
        <div className={styles.site}>
          <div className={styles.sparkle} aria-hidden="true" />

          <div className={styles.topBar}>
            <Link to="/" className={styles.back}>
              &lt;&lt; back to vincente.cl homepage!!!!
            </Link>
            <span className={styles.hitCounter}>
              visitors: <b>000000067</b>
            </span>
          </div>

          <p className={styles.marqueeWrap} aria-hidden="true">
            <span className={styles.marqueeTrack}>
              ★★★ WELCOME TO MY WEBSITE ★★★ BOOKMARK US AND SHARE US IN MYSPACE!! ★★★
              UNDER CONSTRUCTION ★★★ SIGN THE GUESTBOOK ★★★ THIS SITE IS AWESOME
              ★★★ VISITALAS.CL POC NOW AVAILABLE ★★★ WAITING FOR Y COMBINATOR BATCH UPDATES ★★★
              REMOVED HEROBRINE! ★★★ UNDER CONSTRUCTION ★★★
            </span>
          </p>

          <header className={styles.hero}>
            <p className={styles.blink}>*** NEW ***</p>
            <h1 className={styles.wordart} aria-label="visitalas.cl">
              <span className={styles.wordartFace}>visitalas.cl</span>
            </h1>
            <p className={styles.tagline}>
              ~*~ the #1 real-estate agent SaaS on the information superhighway
              ~*~
            </p>
          </header>

          <div className={styles.divider} aria-hidden="true">
            <span>✧･ﾟ:* </span>
            <span className={styles.dividerMid}>✦ ✦ ✦</span>
            <span> *:･ﾟ✧</span>
          </div>

          <main className={styles.main}>
            <aside className={styles.sidebar}>
              <div className={styles.box}>
                <h2 className={styles.boxTitle}>cool links</h2>
                <ul>
                  <li>
                    <a href={VISITALAS_POC_URL} target="_blank" rel="noreferrer">
                      the POC (secret!!)
                    </a>
                  </li>
                  <li>
                    <Link to="/">vincente.cl</Link>
                  </li>
                  <li>
                    <Link to="/resume">my resume!!!!</Link>
                  </li>
                  <li>
                    <span className={styles.dead}>chatroom (coming soon)</span>
                  </li>
                </ul>
              </div>
              <div className={`${styles.box} ${styles.boxHot}`}>
                <p className={styles.blink}>HOT!</p>
                <p className={styles.sidebarNote}>
                  I'm currently submiting this to Y Combinator and I'm waiting for the BEST!!!
                  </p>
              </div>
            </aside>

            <section className={styles.content}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.flash}>ABOUT THIS SITE</span>
              </h2>
              {ABOUT.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className={styles.copy}>
                  {paragraph}
                </p>
              ))}
              <div className={styles.banner}>
                <span className={styles.bannerText}>
                  !! WARNING: since the POC page is supposed to be serious functional tool, it's not gonna be as interesting or fun as my page so far !!
                </span>
              </div>

              <p className={styles.copy}>
                Thank you for visiting my homepage on the World Wide Web. Please
                tell your friends. Please tell your enemies. Please tell your
                mom.
              </p>

              <div className={styles.ctaWrap}>
                <a
                  className={styles.cta}
                  href={VISITALAS_POC_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Take me to the POC!
                </a>
              </div>
            </section>
          </main>

          <footer className={styles.footer}>
            <p>© 2003-2026 visitalas.cl — all rights reserved or whatever</p>
            <p className={styles.footerNote}>
              made with microsoft frontpage energy · no rights reserved for the
              lorem
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
