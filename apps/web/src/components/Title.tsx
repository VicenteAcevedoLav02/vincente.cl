import { useRef, useState, type CSSProperties } from "react"
import { playLevelUp } from "../audio/sfx.ts"
import { letterActions, letterColors, titleLetters } from "../config/letters.ts"
import { claimTitleRaise, titleIsRaised } from "../game/titleRaise.ts"
import { TitleLetter } from "./TitleLetter.tsx"
import styles from "./Title.module.css"

type TitleStyle = CSSProperties & {
  "--wave-steps": number
}

const TITLE_TOP = 40

interface TitleProps {
  onRaise: () => void
}

export function Title({ onRaise }: TitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [shift, setShift] = useState(0)
  const [struck, setStruck] = useState(false)

  const raise = () => {
    const node = titleRef.current
    if (!node || titleIsRaised()) {
      return
    }
    claimTitleRaise()
    const frame = node.closest("[data-frame]")
    const frameTop = frame instanceof HTMLElement ? frame.getBoundingClientRect().top : 0
    const top = node.getBoundingClientRect().top - frameTop
    setShift(Math.min(0, TITLE_TOP - top))
    setStruck(true)
    playLevelUp()
    onRaise()
  }

  const style: TitleStyle = {
    "--wave-steps": Math.max(titleLetters.length - 1, 1),
    transform: `translateY(${shift}px)`,
  }

  return (
    <h1 ref={titleRef} className={styles.title} style={style} onClick={raise}>
      {titleLetters.map((char, index) => (
        <TitleLetter
          key={`${char}-${index}`}
          char={char}
          color={letterColors[index] ?? "#111111"}
          index={index}
          struck={struck}
          onClick={() => {
            letterActions[index]?.()
          }}
        />
      ))}
    </h1>
  )
}
