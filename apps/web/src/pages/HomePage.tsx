import { useCallback, useEffect, useState } from "react"
import { playWarp } from "../audio/sfx.ts"
import { CrtBoot } from "../components/CrtBoot.tsx"
import { BackgroundMidiPlayer } from "../components/BackgroundMidiPlayer.tsx"
import { DebugPanel } from "../components/DebugPanel.tsx"
import { FlySwat } from "../components/FlySwat.tsx"
import { Footer } from "../components/Footer.tsx"
import { ProjectList } from "../components/ProjectList.tsx"
import { Title } from "../components/Title.tsx"
import { preloadImages } from "../game/resources.ts"
import { publicUrl } from "../publicUrl.ts"
import styles from "../App.module.css"

const IMAGE_ASSETS = [
  { id: "fly1", label: "FLY1.PNG", url: publicUrl("/images/fly1.png") },
  { id: "fly2", label: "FLY2.PNG", url: publicUrl("/images/fly2.png") },
  { id: "swat_idle", label: "SWAT_IDLE", url: publicUrl("/images/swat_idle.png") },
  { id: "swat_2", label: "SWAT_2", url: publicUrl("/images/swat_2.png") },
  { id: "swat_3", label: "SWAT_3", url: publicUrl("/images/swat_3.png") },
  {
    id: "swat_active",
    label: "SWAT_ACT",
    url: publicUrl("/images/swat_active.png"),
  },
] as const

export function HomePage() {
  const [year, setYear] = useState(2026)
  const [pop, setPop] = useState(0)
  const [booted, setBooted] = useState(false)
  const [raised, setRaised] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)
  const [debugBooting, setDebugBooting] = useState(false)

  useEffect(() => {
    void preloadImages(IMAGE_ASSETS)
  }, [])

  const finishBoot = useCallback(() => {
    setBooted(true)
  }, [])

  const finishDebugBoot = useCallback(() => {
    setDebugBooting(false)
  }, [])

  const openDebug = useCallback(() => {
    playWarp()
    setDebugOpen(true)
    setDebugBooting(true)
  }, [])

  const closeDebug = useCallback(() => {
    setDebugBooting(false)
    setDebugOpen(false)
  }, [])

  const toggleDebug = useCallback(() => {
    if (!booted) {
      return
    }
    if (debugOpen) {
      closeDebug()
      return
    }
    openDebug()
  }, [booted, closeDebug, debugOpen, openDebug])

  useEffect(() => {
    if (!debugOpen) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDebug()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
    }
  }, [closeDebug, debugOpen])

  const scoreFly = () => {
    setYear((current) => current + 1)
    setPop((current) => current + 1)
  }

  return (
    <div className={debugOpen ? `${styles.shell} ${styles.docked}` : styles.shell}>
      <div className={styles.page} data-frame="">
        <BackgroundMidiPlayer />
        <FlySwat ready={booted} onScore={scoreFly} />
        <main className={styles.stage}>
          <Title onRaise={() => setRaised(true)} />
        </main>
        {raised ? <ProjectList /> : null}
        <Footer
          year={year}
          pop={pop}
          debugOpen={debugOpen}
          onToggleDebug={toggleDebug}
        />
        {booted ? null : <CrtBoot onDone={finishBoot} />}
      </div>
      {debugOpen ? (
        <aside className={styles.debugPane} aria-label="System debug">
          {debugBooting ? <CrtBoot playSound={false} onDone={finishDebugBoot} /> : null}
          <DebugPanel
            visible={!debugBooting}
            onClose={closeDebug}
            year={year}
            score={pop}
            booted={booted}
          />
        </aside>
      ) : null}
    </div>
  )
}
