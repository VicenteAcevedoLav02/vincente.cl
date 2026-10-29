import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { playChannelChange } from "../audio/sfx.ts"
import { publicUrl } from "../publicUrl.ts"
import styles from "./ResumePage.module.css"

const CLIPPY_IDLE = publicUrl("/images/clippy-black-6.gif")
const CLIPPY_EXIT = publicUrl("/images/clippy-black-17.gif")
/** Sum of GIF frame delays in clippy-black-17.gif at 2x (47 × 5cs). */
const CLIPPY_EXIT_MS = 2350

const LOREM = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vehicula,
urna a tincidunt aliquet, nisl lorem vestibulum magna, sit amet egestas
libero nisl id justo. Praesent sollicitudin, magna non tincidunt viverra,
odio libero luctus nisl, vitae tristique magna elit eu magna.

Suspendisse potenti. Cras ac nisl ac magna ultrices feugiat. Donec
porttitor, purus eget luctus gravida, lectus eros ultrices justo, at
volutpat elit metus et arcu. Vivamus ac metus at magna ullamcorper
tincidunt. Nam id lectus ac magna fringilla laoreet.

Pellentesque habitant morbi tristique senectus et netus et malesuada fames
ac turpis egestas. Aenean sit amet justo eget magna consequat viverra.
Curabitur et nisl at magna volutpat tincidunt. Nulla facilisi. Mauris
vitae magna et magna dignissim tincidunt.

Integer in magna sit amet magna aliquam tincidunt. Sed euismod, magna at
ultricies tincidunt, magna magna tincidunt magna, sit amet tincidunt magna
magna sit amet magna. Vestibulum ante ipsum primis in faucibus orci luctus
et ultrices posuere cubilia curae.

Fusce at magna et magna tincidunt tincidunt. Proin sit amet magna sit amet
magna tincidunt aliquam. Aliquam erat volutpat. Donec eget magna sit amet
magna tincidunt tincidunt. Morbi sit amet magna sit amet magna tincidunt
aliquam sit amet magna.

Nullam sit amet magna sit amet magna tincidunt tincidunt. Etiam sit amet
magna sit amet magna aliquam tincidunt. Quisque sit amet magna sit amet
magna tincidunt aliquam. Ut sit amet magna sit amet magna tincidunt
tincidunt sit amet magna.
`.trim()

const LOREM_PARAGRAPHS = LOREM.split(/\n\n+/)

type AvisoPhase = "open" | "leaving" | "gone"

function PixelChevron() {
  return (
    <svg
      className={styles.chevron}
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

export function ResumePage() {
  const [phase, setPhase] = useState<AvisoPhase>("open")
  const [exitSrc, setExitSrc] = useState<string | null>(null)

  useEffect(() => {
    playChannelChange()
  }, [])

  useEffect(() => {
    if (phase !== "leaving") {
      return
    }
    const timer = window.setTimeout(() => {
      setPhase("gone")
      setExitSrc(null)
    }, CLIPPY_EXIT_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [phase])

  const dismissAviso = () => {
    if (phase !== "open") {
      return
    }
    setExitSrc(`${CLIPPY_EXIT}?t=${Date.now()}`)
    setPhase("leaving")
  }

  const avisoActive = phase !== "gone"

  return (
    <div className={styles.shell}>
      {avisoActive ? (
        <>
          <div
            className={
              phase === "leaving"
                ? `${styles.dimmer} ${styles.dimmerLeaving}`
                : styles.dimmer
            }
            aria-hidden="true"
          />
          <div className={styles.aviso}>
            <img
              className={styles.clippy}
              src={phase === "leaving" && exitSrc ? exitSrc : CLIPPY_IDLE}
              alt=""
              width={160}
              height={160}
              decoding="async"
            />
            <div
              className={
                phase === "leaving"
                  ? `${styles.dialog} ${styles.dialogLeaving}`
                  : styles.dialog
              }
              role="alertdialog"
              aria-modal={phase === "open"}
              aria-labelledby="resume-aviso-title"
              aria-hidden={phase === "leaving"}
            >
              <p id="resume-aviso-title" className={styles.dialogText}>
                Vicente is now Open To Work! If you are interested in working
                with me, please contact me at{" "}
                <a href="mailto:vicenteacevedolav@gmail.com">this mail</a>.
              </p>
              {phase === "open" ? (
                <button
                  type="button"
                  className={styles.ok}
                  autoFocus
                  onClick={dismissAviso}
                >
                  OK
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div
        className={phase === "open" ? `${styles.page} ${styles.pageLocked}` : styles.page}
        data-frame=""
      >
        <header className={styles.header}>
          <Link to="/" className={styles.back} aria-label="Back to home">
            <PixelChevron />
          </Link>
          <h1 className={styles.title}>Resume</h1>
        </header>
        <main className={styles.content}>
          {Array.from({ length: 3 }, (_, copy) =>
            LOREM_PARAGRAPHS.map((paragraph, index) => (
              <p key={`${copy}-${index}`}>{paragraph}</p>
            )),
          )}
        </main>
      </div>
    </div>
  )
}
