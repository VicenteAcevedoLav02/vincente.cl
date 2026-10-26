import type { CSSProperties } from "react"
import styles from "./TitleLetter.module.css"

type LetterStyle = CSSProperties & {
  "--letter": string
  "--index": number
}

type TitleLetterProps = {
  char: string
  color: string
  index: number
  struck: boolean
  onClick: () => void
}

function accessibleName(char: string): string {
  if (char === ".") {
    return "Letter period"
  }
  return `Letter ${char}`
}

export function TitleLetter({ char, color, index, struck, onClick }: TitleLetterProps) {
  const style: LetterStyle = {
    "--letter": color,
    "--index": index,
  }

  return (
    <button
      type="button"
      className={struck ? `${styles.letter} ${styles.struck}` : styles.letter}
      style={style}
      aria-label={accessibleName(char)}
      onClick={onClick}
    >
      <span className={styles.glyph}>{char}</span>
    </button>
  )
}
