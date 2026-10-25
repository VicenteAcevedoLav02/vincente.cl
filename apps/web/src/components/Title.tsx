import type { CSSProperties } from "react"
import { letterActions, letterColors, titleLetters } from "../config/letters.ts"
import { TitleLetter } from "./TitleLetter.tsx"
import styles from "./Title.module.css"

type TitleStyle = CSSProperties & {
  "--wave-steps": number
}

export function Title() {
  const style: TitleStyle = {
    "--wave-steps": Math.max(titleLetters.length - 1, 1),
  }

  return (
    <h1 className={styles.title} style={style}>
      {titleLetters.map((char, index) => (
        <TitleLetter
          key={`${char}-${index}`}
          char={char}
          color={letterColors[index] ?? "#111111"}
          index={index}
          onClick={() => {
            letterActions[index]?.()
          }}
        />
      ))}
    </h1>
  )
}
