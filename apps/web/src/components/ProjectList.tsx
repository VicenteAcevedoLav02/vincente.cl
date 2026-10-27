import { useEffect, useRef, useState } from "react"
import { projects } from "../config/projects.ts"
import styles from "./ProjectList.module.css"

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function PixelChevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      className={up ? `${styles.icon} ${styles.iconUp}` : styles.icon}
      viewBox="0 0 14 8"
      width="14"
      height="8"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect x="1" y="0" width="12" height="2" fill="currentColor" />
      <rect x="3" y="2" width="8" height="2" fill="currentColor" />
      <rect x="5" y="4" width="4" height="2" fill="currentColor" />
      <rect x="6" y="6" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

export function ProjectList() {
  const [open, setOpen] = useState(prefersReducedMotion)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(true)
  const viewportRef = useRef<HTMLDivElement>(null)

  const updateHints = () => {
    const node = viewportRef.current
    if (!node) {
      return
    }
    const top = node.scrollTop
    const max = node.scrollHeight - node.clientHeight
    setCanScrollUp(top > 2)
    setCanScrollDown(max - top > 2)
  }

  useEffect(() => {
    if (!open) {
      return
    }
    updateHints()
  }, [open])

  return (
    <nav className={open ? `${styles.list} ${styles.open}` : styles.list} aria-label="Projects">
      <div
        className={styles.stack}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(true)
            updateHints()
          }
        }}
      >
        <div
          className={
            canScrollUp
              ? `${styles.chevron} ${styles.chevronUp}`
              : `${styles.chevron} ${styles.chevronUp} ${styles.hidden}`
          }
          aria-hidden="true"
        >
          <PixelChevron up />
        </div>
        <div ref={viewportRef} className={styles.viewport} onScroll={updateHints}>
          <ul className={styles.items}>
            {projects.map((project) => (
              <li key={project.label}>
                <a
                  className={styles.link}
                  href={project.href}
                  onClick={(event) => {
                    if (project.href === "#") {
                      event.preventDefault()
                    }
                  }}
                >
                  {project.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={
            canScrollDown
              ? `${styles.chevron} ${styles.chevronDown}`
              : `${styles.chevron} ${styles.chevronDown} ${styles.hidden}`
          }
          aria-hidden="true"
        >
          <PixelChevron />
        </div>
      </div>
    </nav>
  )
}
