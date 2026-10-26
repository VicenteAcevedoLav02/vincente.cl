import { useEffect } from "react"
import { playPowerOn } from "../audio/sfx.ts"
import styles from "./CrtBoot.module.css"

interface CrtBootProps {
  onDone: () => void
}

export function CrtBoot({ onDone }: CrtBootProps) {
  useEffect(() => {
    playPowerOn()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      onDone()
      return
    }
    const timer = window.setTimeout(onDone, 1900)
    return () => {
      window.clearTimeout(timer)
    }
  }, [onDone])

  return (
    <div
      className={styles.crt}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          onDone()
        }
      }}
    >
      <div className={styles.beam} />
    </div>
  )
}
