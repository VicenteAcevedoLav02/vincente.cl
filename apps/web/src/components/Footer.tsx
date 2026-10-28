import { CopyrightMark } from "./CopyrightMark.tsx"
import styles from "./Footer.module.css"

interface FooterProps {
  year: number
  pop: number
  debugOpen: boolean
  onToggleDebug: () => void
}

export function Footer({ year, pop, debugOpen, onToggleDebug }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        ™ &{" "}
        <CopyrightMark debugOpen={debugOpen} onToggleDebug={onToggleDebug} />{" "}
        <span className={styles.year}>
          <span key={year} className={pop > 0 ? styles.bump : undefined}>
            {year}
          </span>
          {pop > 0 ? (
            <span key={pop} className={styles.plus} aria-hidden="true">
              +1
            </span>
          ) : null}
        </span>{" "}
        Vicente Acevedo
      </p>
    </footer>
  )
}
