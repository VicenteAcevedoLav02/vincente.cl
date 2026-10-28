import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { playFlyBuzz, playFlyHit, playSwatMiss, stopFlyBuzz } from "../audio/sfx.ts"
import { createFlyPath, pointOnPath, type Point } from "../game/flyPath.ts"
import { titleIsRaised } from "../game/titleRaise.ts"
import { publicUrl } from "../publicUrl.ts"
import styles from "./FlySwat.module.css"

const FLIGHT_MS = 5000
const GAP_MS = 5000
const FALL_MS = 800
const FLAP_MS = 90
const FLY_WIDTH = 52
const FLY_HEIGHT = 32
const SWAT_WIDTH = 128
const SWAT_HEIGHT = 160
const SWAT_HOT_X = 62
const SWAT_HOT_Y = 28

const FLY_FRAMES = [publicUrl("/images/fly1.png"), publicUrl("/images/fly2.png")] as const

const SWAT_SRC = {
  idle: publicUrl("/images/swat_idle.png"),
  two: publicUrl("/images/swat_2.png"),
  three: publicUrl("/images/swat_3.png"),
  active: publicUrl("/images/swat_active.png"),
} as const

type SwatFrame = keyof typeof SWAT_SRC

const MISS_SWING: Array<{ frame: SwatFrame; ms: number }> = [
  { frame: "two", ms: 70 },
  { frame: "three", ms: 80 },
  { frame: "two", ms: 70 },
]

const HIT_SWING: Array<{ frame: SwatFrame; ms: number }> = [
  { frame: "two", ms: 70 },
  { frame: "three", ms: 80 },
  { frame: "active", ms: 240 },
  { frame: "three", ms: 80 },
  { frame: "two", ms: 70 },
]

interface FlyHandle {
  trySwat: (x: number, y: number) => boolean
}

interface FlyProps {
  path: readonly Point[]
  arenaHeight: number
  onFinished: () => void
}

const Fly = forwardRef<FlyHandle, FlyProps>(function Fly(
  { path, arenaHeight, onFinished },
  handle,
) {
  const nodeRef = useRef<HTMLImageElement>(null)
  const finished = useRef(false)
  const phaseRef = useRef<"fly" | "fall">("fly")
  const onFinishedRef = useRef(onFinished)
  const initialPoint = path[0] ?? { x: -80, y: -80 }
  const posRef = useRef<Point>(initialPoint)
  const [pos, setPos] = useState<Point>(initialPoint)
  const [face, setFace] = useState(1)
  const [frame, setFrame] = useState(0)
  const [phase, setPhase] = useState<"fly" | "fall">("fly")

  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])

  useImperativeHandle(handle, () => ({
    trySwat(x: number, y: number) {
      const node = nodeRef.current
      if (!node || phaseRef.current !== "fly") {
        return false
      }
      const rect = node.getBoundingClientRect()
      const pad = 10
      const hit =
        x >= rect.left - pad &&
        x <= rect.right + pad &&
        y >= rect.top - pad &&
        y <= rect.bottom + pad
      if (!hit) {
        return false
      }
      phaseRef.current = "fall"
      setPhase("fall")
      setFrame(0)
      return true
    },
  }))

  useEffect(() => {
    if (phase !== "fly") {
      return
    }
    let alive = true
    let raf = 0
    const started = performance.now()
    const tick = (now: number) => {
      if (!alive) {
        return
      }
      const progress = Math.min(1, (now - started) / FLIGHT_MS)
      const next = pointOnPath(path, progress)
      const previous = posRef.current
      if (next.x < previous.x - 0.4) {
        setFace(-1)
      } else if (next.x > previous.x + 0.4) {
        setFace(1)
      }
      posRef.current = next
      setPos(next)
      setFrame(Math.floor((now - started) / FLAP_MS) % FLY_FRAMES.length)
      if (progress >= 1) {
        if (alive && !finished.current) {
          finished.current = true
          onFinishedRef.current()
        }
        return
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
    }
  }, [path, phase])

  useEffect(() => {
    if (phase !== "fall") {
      return
    }
    let alive = true
    let raf = 0
    const started = performance.now()
    const origin = posRef.current
    const targetY = arenaHeight + FLY_HEIGHT
    const tick = (now: number) => {
      if (!alive) {
        return
      }
      const progress = Math.min(1, (now - started) / FALL_MS)
      const eased = progress * progress
      const next = {
        x: origin.x,
        y: origin.y + (targetY - origin.y) * eased,
      }
      posRef.current = next
      setPos(next)
      if (progress >= 1) {
        if (alive && !finished.current) {
          finished.current = true
          onFinishedRef.current()
        }
        return
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      alive = false
      window.cancelAnimationFrame(raf)
    }
  }, [arenaHeight, phase])

  const sprite = phase === "fall" ? FLY_FRAMES[0] : FLY_FRAMES[frame] ?? FLY_FRAMES[0]

  return (
    <img
      ref={nodeRef}
      className={styles.fly}
      src={sprite}
      width={FLY_WIDTH}
      height={FLY_HEIGHT}
      alt=""
      draggable={false}
      style={{
        transform: `translate(${pos.x - FLY_WIDTH / 2}px, ${pos.y - FLY_HEIGHT / 2}px) scaleX(${face})`,
      }}
    />
  )
})

interface FlySwatProps {
  onScore: () => void
  ready: boolean
}

interface ActiveFly {
  id: number
  path: readonly Point[]
  height: number
}

export function FlySwat({ onScore, ready }: FlySwatProps) {
  const flyRef = useRef<FlyHandle>(null)
  const swingTimer = useRef(0)
  const gapTimer = useRef(0)
  const onScoreRef = useRef(onScore)
  const [fly, setFly] = useState<ActiveFly | null>(null)
  const [pointer, setPointer] = useState({ x: -200, y: -200, visible: false })
  const [swatFrame, setSwatFrame] = useState<SwatFrame>("idle")
  const armGapRef = useRef<() => void>(() => {})
  const fieldRef = useRef<HTMLDivElement>(null)
  const pointerDownRef = useRef(false)
  const resumeSwingRef = useRef<(() => void) | null>(null)

  const playSwing = (hit: boolean) => {
    window.clearTimeout(swingTimer.current)
    resumeSwingRef.current = null
    const frames = hit ? HIT_SWING : MISS_SWING
    let index = 0
    const step = () => {
      const current = frames[index]
      if (!current) {
        resumeSwingRef.current = null
        setSwatFrame("idle")
        return
      }
      setSwatFrame(current.frame)
      index += 1
      if (current.frame === "three" && pointerDownRef.current) {
        const delay = current.ms
        resumeSwingRef.current = () => {
          swingTimer.current = window.setTimeout(step, delay)
        }
        return
      }
      swingTimer.current = window.setTimeout(step, current.ms)
    }
    step()
  }

  useEffect(() => {
    onScoreRef.current = onScore
  }, [onScore])

  useEffect(() => {
    if (!ready) {
      return
    }

    const arm = () => {
      window.clearTimeout(gapTimer.current)
      gapTimer.current = window.setTimeout(() => {
        const field = fieldRef.current
        const width = field?.clientWidth || Math.min(window.innerWidth, window.innerHeight)
        const height = field?.clientHeight || width
        setFly({
          id: performance.now(),
          path: createFlyPath(width, height),
          height,
        })
        playFlyBuzz()
      }, GAP_MS)
    }
    armGapRef.current = arm

    const onMove = (event: PointerEvent) => {
      setPointer({ x: event.clientX, y: event.clientY, visible: true })
    }
    const onLeave = () => {
      setPointer((current) => ({ ...current, visible: false }))
    }
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return
      }
      const hit = flyRef.current?.trySwat(event.clientX, event.clientY) ?? false
      const target = event.target instanceof Element ? event.target : null
      const onTitle = Boolean(target?.closest("h1"))
      const onDebugControl = Boolean(
        target?.closest("[data-debug-toggle], [data-debug-close], aside"),
      )
      if (hit) {
        stopFlyBuzz()
        playFlyHit()
        onScoreRef.current()
      } else if (!onDebugControl && !(onTitle && !titleIsRaised())) {
        playSwatMiss()
      }
      pointerDownRef.current = true
      playSwing(hit)
    }
    const onUp = (event: PointerEvent) => {
      if (event.button !== 0) {
        return
      }
      pointerDownRef.current = false
      const resume = resumeSwingRef.current
      resumeSwingRef.current = null
      resume?.()
    }

    arm()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    window.addEventListener("pointerleave", onLeave)
    return () => {
      stopFlyBuzz()
      window.clearTimeout(gapTimer.current)
      window.clearTimeout(swingTimer.current)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      window.removeEventListener("pointerleave", onLeave)
    }
  }, [ready])

  return (
    <>
      <div ref={fieldRef} className={styles.field}>
        {fly ? (
          <Fly
            key={fly.id}
            ref={flyRef}
            path={fly.path}
            arenaHeight={fly.height}
            onFinished={() => {
              stopFlyBuzz()
              setFly(null)
              armGapRef.current()
            }}
          />
        ) : null}
      </div>
      <img
        className={styles.cursor}
        src={SWAT_SRC[swatFrame]}
        width={SWAT_WIDTH}
        height={SWAT_HEIGHT}
        alt=""
        draggable={false}
        style={{
          transform: `translate(${pointer.x - SWAT_HOT_X}px, ${pointer.y - SWAT_HOT_Y}px)`,
          opacity: pointer.visible ? 1 : 0,
        }}
      />
    </>
  )
}
