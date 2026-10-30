import { useEffect, useRef, useState, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import "@fontsource/barlow-condensed/600.css"
import { playChannelStatic } from "../audio/sfx.ts"
import styles from "./ChannelTransition.module.css"

/** Static snow is visible, then clears; channel lingers and fades after. */
const STATIC_MS = 520
const CHANNEL_FADE_MS = 1400
const TOTAL_MS = STATIC_MS + CHANNEL_FADE_MS
const REDUCED_TOTAL_MS = 420

interface Burst {
  id: number
  channel: number
}

function randomChannel(): number {
  return Math.floor(Math.random() * 99) + 1
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function StaticBurst({ channel, onDone }: { channel: number; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const reduced = prefersReducedMotion()
  const label = `CH ${String(channel).padStart(2, "0")}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      return
    }

    const resize = () => {
      const box = canvas.parentElement?.getBoundingClientRect()
      // Fine CRT snow grain (closer to real tuner static).
      const side = Math.max(180, Math.floor((box?.width ?? 320) / 2.2))
      canvas.width = side
      canvas.height = side
    }
    resize()

    let frame = 0
    let raf = 0
    let painting = true
    const paint = () => {
      if (!painting) {
        return
      }
      const { width, height } = canvas
      const image = ctx.createImageData(width, height)
      const data = image.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
      if (frame % 2 === 0) {
        const y = (Math.random() * height) | 0
        const thick = 1 + ((Math.random() * 2) | 0)
        for (let row = 0; row < thick; row += 1) {
          const yy = Math.min(height - 1, y + row)
          for (let x = 0; x < width; x += 1) {
            const i = (yy * width + x) * 4
            const flash = Math.random() > 0.45 ? 255 : 20
            data[i] = flash
            data[i + 1] = flash
            data[i + 2] = flash
          }
        }
      }
      ctx.putImageData(image, 0, 0)
      frame += 1
      raf = window.requestAnimationFrame(paint)
    }
    raf = window.requestAnimationFrame(paint)

    const stopNoise = window.setTimeout(
      () => {
        painting = false
        window.cancelAnimationFrame(raf)
      },
      reduced ? 160 : STATIC_MS,
    )
    const done = window.setTimeout(
      () => {
        onDoneRef.current()
      },
      reduced ? REDUCED_TOTAL_MS : TOTAL_MS,
    )
    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    return () => {
      painting = false
      window.cancelAnimationFrame(raf)
      window.clearTimeout(stopNoise)
      window.clearTimeout(done)
      window.removeEventListener("resize", onResize)
    }
  }, [reduced])

  return (
    <div
      className={reduced ? `${styles.overlay} ${styles.overlayReduced}` : styles.overlay}
      aria-hidden="true"
    >
      <div className={styles.noiseWrap}>
        <canvas ref={canvasRef} className={styles.noise} />
      </div>
      <div className={styles.channel}>{label}</div>
    </div>
  )
}

export function ChannelTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const skipFirst = useRef(true)
  const [burst, setBurst] = useState<Burst | null>(null)

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    playChannelStatic()
    setBurst({ id: Date.now(), channel: randomChannel() })
  }, [location.pathname])

  return (
    <>
      {children}
      {burst ? (
        <StaticBurst
          key={burst.id}
          channel={burst.channel}
          onDone={() => setBurst((current) => (current?.id === burst.id ? null : current))}
        />
      ) : null}
    </>
  )
}
