import styles from "./CopyrightMark.module.css"

interface CopyrightMarkProps {
  debugOpen: boolean
  onToggleDebug: () => void
}

export function CopyrightMark({ debugOpen, onToggleDebug }: CopyrightMarkProps) {
  return (
    <button
      type="button"
      className={styles.mark}
      data-debug-toggle=""
      aria-label={debugOpen ? "Close system debug" : "Open system debug"}
      aria-pressed={debugOpen}
      onClick={onToggleDebug}
    >
      ©
    </button>
  )
}
