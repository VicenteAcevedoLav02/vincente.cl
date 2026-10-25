import { Footer } from "./components/Footer.tsx"
import { Title } from "./components/Title.tsx"
import styles from "./App.module.css"

export default function App() {
  return (
    <div className={styles.page}>
      <main className={styles.stage}>
        <Title />
      </main>
      <Footer />
    </div>
  )
}
