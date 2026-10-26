import { useState } from "react"
import { projects } from "../config/projects.ts"
import styles from "./ProjectList.module.css"

export function ProjectList() {
  const [open, setOpen] = useState(false)

  return (
    <nav className={open ? `${styles.list} ${styles.open}` : styles.list} aria-label="Projects">
      <ul
        className={styles.items}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(true)
          }
        }}
      >
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
    </nav>
  )
}
