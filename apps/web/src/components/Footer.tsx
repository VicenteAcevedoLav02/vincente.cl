import styles from "./Footer.module.css"

interface FooterProps {
  year: number
  pop: number
}

export function Footer({ year, pop }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.text} aria-live="polite">
        ™ & ©{" "}
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
