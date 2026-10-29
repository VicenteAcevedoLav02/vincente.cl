import { useEffect } from "react"
import { Link } from "react-router-dom"
import { playChannelChange } from "../audio/sfx.ts"
import styles from "./ResumePage.module.css"

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

export function ResumePage() {
  useEffect(() => {
    playChannelChange()
  }, [])

  return (
    <div className={styles.shell}>
      <div className={styles.page} data-frame="">
        <header className={styles.header}>
          <Link to="/" className={styles.back} aria-label="Back to home">
            <span className={styles.backBar} aria-hidden="true" />
            <span className={styles.backLabel}>BACK</span>
          </Link>
          <h1 className={styles.title}>Resume</h1>
        </header>
        <main className={styles.content}>
          {LOREM.split(/\n\n+/).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </main>
      </div>
    </div>
  )
}
