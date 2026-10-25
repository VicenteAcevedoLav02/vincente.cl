import { letterActions, letterColors, titleLetters } from "../config/letters.ts"
import { TitleLetter } from "./TitleLetter.tsx"
import styles from "./Title.module.css"

export function Title() {
  return (
    <h1 className={styles.title}>
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
