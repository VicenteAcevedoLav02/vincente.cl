import { useCallback, useState } from "react"
import { CrtBoot } from "./components/CrtBoot.tsx"
import { BackgroundMidiPlayer } from "./components/BackgroundMidiPlayer.tsx"
import { FlySwat } from "./components/FlySwat.tsx"
import { Footer } from "./components/Footer.tsx"
import { ProjectList } from "./components/ProjectList.tsx"
import { Title } from "./components/Title.tsx"
import styles from "./App.module.css"

export default function App() {
  const [year, setYear] = useState(2026)
  const [pop, setPop] = useState(0)
  const [booted, setBooted] = useState(false)
  const [raised, setRaised] = useState(false)
  const finishBoot = useCallback(() => {
    setBooted(true)
  }, [])

  const scoreFly = () => {
    setYear((current) => current + 1)
    setPop((current) => current + 1)
  }

  return (
    <div className={styles.shell}>
      <div className={styles.page} data-frame="">
        <BackgroundMidiPlayer />
        <FlySwat ready={booted} onScore={scoreFly} />
        <main className={styles.stage}>
          <Title onRaise={() => setRaised(true)} />
        </main>
        {raised ? <ProjectList /> : null}
        <Footer year={year} pop={pop} />
        {booted ? null : <CrtBoot onDone={finishBoot} />}
      </div>
    </div>
  )
}
