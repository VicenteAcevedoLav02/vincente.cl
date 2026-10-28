import { useEffect, useState, useSyncExternalStore } from "react"
import * as Tone from "tone"
import { getSfxStatus } from "../audio/sfx.ts"
import {
  getResources,
  subscribeResources,
  type ResourceStatus,
} from "../game/resources.ts"
import { titleIsRaised } from "../game/titleRaise.ts"
import styles from "./DebugPanel.module.css"

interface DebugPanelProps {
  visible: boolean
  onClose: () => void
  year: number
  score: number
  booted: boolean
}

function padLabel(label: string, width: number): string {
  if (label.length >= width) {
    return label.slice(0, width)
  }
  return `${label}${".".repeat(width - label.length)}`
}

function statusWord(status: ResourceStatus): string {
  if (status === "ready") {
    return "READY"
  }
  if (status === "loading") {
    return "LOAD"
  }
  if (status === "error") {
    return "FAIL"
  }
  return "IDLE"
}

function useResources() {
  return useSyncExternalStore(subscribeResources, getResources, getResources)
}

export function DebugPanel({
  visible,
  onClose,
  year,
  score,
  booted,
}: DebugPanelProps) {
  const resources = useResources()
  const [clock, setClock] = useState(() => performance.now())
  const [fps, setFps] = useState(0)
  const [audioState, setAudioState] = useState("unknown")
  const [view, setView] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!visible) {
      return
    }
    let frames = 0
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      frames += 1
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
        setClock(now)
        setAudioState(Tone.getContext().state)
        setView({ w: window.innerWidth, h: window.innerHeight })
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(raf)
    }
  }, [visible])

  const sfx = getSfxStatus()
  const readyCount = resources.filter((entry) => entry.status === "ready").length
  const failCount = resources.filter((entry) => entry.status === "error").length
  const uptime = Math.floor(clock / 1000)

  return (
    <div className={visible ? `${styles.panel} ${styles.visible}` : styles.panel}>
      <div className={styles.scanlines} aria-hidden="true" />
      <header className={styles.header}>
        <span>VINCENTE.CL // SYS</span>
        <span className={styles.cursor} aria-hidden="true">
          █
        </span>
      </header>
      <div className={styles.rule} aria-hidden="true">
        --------------------
      </div>
      <ul className={styles.rows}>
        <li>{padLabel("BOOT", 10)} {booted ? "OK" : "WAIT"}</li>
        <li>{padLabel("AUDIO", 10)} {audioState.toUpperCase()}</li>
        <li>{padLabel("FPS", 10)} {fps || "--"}</li>
        <li>
          {padLabel("VIEW", 10)} {view.w}x{view.h}
        </li>
        <li>{padLabel("UPTIME", 10)} {uptime}S</li>
        <li>{padLabel("TITLE", 10)} {titleIsRaised() ? "RAISED" : "CENTER"}</li>
        <li>{padLabel("YEAR", 10)} {year}</li>
        <li>{padLabel("SCORE", 10)} +{score}</li>
        <li>
          {padLabel("SFX", 10)} {sfx.loaded ? `${sfx.cues} NOTES` : "LOAD"}
        </li>
        <li>
          {padLabel("ASSETS", 10)} {readyCount}/{resources.length}
          {failCount > 0 ? ` ERR ${failCount}` : ""}
        </li>
      </ul>
      <div className={styles.rule} aria-hidden="true">
        -- RESOURCES ---------
      </div>
      <ul className={styles.rows}>
        {resources.map((entry) => (
          <li key={entry.id}>
            {padLabel(entry.label, 12)} {statusWord(entry.status)}
            {entry.detail ? ` ${entry.detail}` : ""}
          </li>
        ))}
      </ul>
      <div className={styles.rule} aria-hidden="true">
        --------------------
      </div>
      <p className={styles.hint}>ESC / © TO EXIT</p>
      <button
        type="button"
        className={styles.close}
        data-debug-close=""
        onClick={onClose}
      >
        CLOSE
      </button>
    </div>
  )
}
