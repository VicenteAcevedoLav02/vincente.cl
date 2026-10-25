import type { CSSProperties } from "react"
import styles from "./TitleLetter.module.css"

type LetterStyle = CSSProperties & {
  "--letter": string
  "--lift": string
}

type TitleLetterProps = {
  char: string
  color: string
  index: number
  onClick: () => void
}

function accessibleName(char: string): string {
  if (char === ".") {
    return "Letter period"
  }
  return `Letter ${char}`
}

export function TitleLetter({ char, color, index, onClick }: TitleLetterProps) {
  const style: LetterStyle = {
    "--letter": color,
    "--lift": index % 2 === 0 ? "-4px" : "4px",
  }

  return (
    <button
      type="button"
      className={styles.letter}
      style={style}
      aria-label={accessibleName(char)}
      onClick={onClick}
    >
      {char}
    </button>
  )
}
