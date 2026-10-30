import { Midi } from "@tonejs/midi"
import * as Tone from "tone"
import { markResource, registerMidi } from "../game/resources.ts"
import { publicUrl } from "../publicUrl.ts"

const SFX_URL = publicUrl("/music/sfx.mid")
const SFX_ID = "sfx.mid"
const SFX_DB = -10
const DRUM_CHANNEL = 9
const FALL_CHANNEL = 14

type CueName = "fly" | "hit" | "miss" | "levelup" | "power" | "warp" | "channel" | "static"

interface SfxNote {
  channel: number
  name: string
  time: number
  duration: number
  velocity: number
}

const CUE_TRACKS: Record<CueName, readonly string[]> = {
  fly: ["Fly"],
  hit: ["Hit Snare", "Hit Buzz", "Hit Fall"],
  miss: ["Miss Snare"],
  levelup: ["Level Up", "Level Snare"],
  power: ["Power Snare", "Power Whine"],
  warp: ["Warp Lead", "Warp Echo", "Warp Tick"],
  channel: ["Channel Snare", "Channel Zap"],
  static: ["Static Snare"],
}

interface Voices {
  volume: Tone.Volume
  buzz: Tone.PolySynth
  sting: Tone.PolySynth
  fall: Tone.PolySynth
  snares: Tone.NoiseSynth[]
  staticNoise: Tone.NoiseSynth
}

let cues: Record<CueName, SfxNote[]> | null = null
let loading: Promise<void> | null = null
let voices: Voices | null = null
let flyGeneration = 0
let snareIndex = 0
const timers = new Map<string, number[]>()

function report(error: unknown): void {
  const message = error instanceof Error ? error.message : "Unexpected failure"
  console.error(`SFX MIDI: ${message}`)
}

function emptyCues(): Record<CueName, SfxNote[]> {
  return {
    fly: [],
    hit: [],
    miss: [],
    levelup: [],
    power: [],
    warp: [],
    channel: [],
    static: [],
  }
}

function loadSfx(): Promise<void> {
  if (!loading) {
    registerMidi(SFX_ID, "SFX.MID", SFX_URL)
    loading = Midi.fromUrl(SFX_URL)
      .then((midi) => {
        const next = emptyCues()
        let notes = 0
        for (const cue of Object.keys(CUE_TRACKS) as CueName[]) {
          const names = new Set(CUE_TRACKS[cue])
          for (const track of midi.tracks) {
            if (!names.has(track.name)) {
              continue
            }
            for (const note of track.notes) {
              if (note.duration <= 0 || !Number.isFinite(note.time)) {
                continue
              }
              next[cue].push({
                channel: track.channel,
                name: note.name,
                time: note.time,
                duration: note.duration,
                velocity: Math.min(1, Math.max(0, note.velocity)),
              })
              notes += 1
            }
          }
        }
        cues = next
        markResource(SFX_ID, "ready", `${notes} NOTES`)
      })
      .catch((error: unknown) => {
        loading = null
        markResource(SFX_ID, "error", "LOAD FAIL")
        report(error)
      })
  }
  return loading
}

export function getSfxStatus(): { loaded: boolean; cues: number } {
  if (!cues) {
    return { loaded: false, cues: 0 }
  }
  return {
    loaded: true,
    cues: Object.values(cues).reduce((sum, notes) => sum + notes.length, 0),
  }
}

function shortSquare(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.004, decay: 0.04, sustain: 0.15, release: 0.03 },
  })
}

function ensureVoices(): Voices | null {
  if (Tone.getContext().state !== "running") {
    return null
  }
  if (voices) {
    return voices
  }
  const volume = new Tone.Volume(SFX_DB).toDestination()
  const buzz = shortSquare().connect(volume)
  const sting = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.005, decay: 0.09, sustain: 0.4, release: 0.08 },
  }).connect(volume)
  const fall = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.25, release: 0.06 },
  }).connect(volume)
  const snares = [0, 1].map(
    () =>
      new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.02 },
      }).connect(volume),
  )
  const staticNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.55, release: 0.18 },
  }).connect(volume)
  voices = { volume, buzz, sting, fall, snares, staticNoise }
  return voices
}

function trigger(cue: CueName, note: SfxNote, bank: Voices): void {
  const when = Tone.now()
  if (cue === "static") {
    bank.staticNoise.triggerAttackRelease(
      Math.max(0.04, note.duration),
      when,
      note.velocity,
    )
    if (note.duration < 0.12) {
      const snare = bank.snares[snareIndex % bank.snares.length]
      snareIndex += 1
      snare?.triggerAttackRelease(note.duration, when, note.velocity * 0.7)
    }
    return
  }
  if (note.channel === DRUM_CHANNEL) {
    const snare = bank.snares[snareIndex % bank.snares.length]
    snareIndex += 1
    snare?.triggerAttackRelease(note.duration, when, note.velocity)
    return
  }
  if (note.channel === FALL_CHANNEL) {
    bank.fall.triggerAttackRelease(note.name, note.duration, when, note.velocity)
    return
  }
  const synth = cue === "fly" ? bank.buzz : bank.sting
  synth.triggerAttackRelease(note.name, note.duration, when, note.velocity)
}

function clearTimers(id: string): void {
  const pending = timers.get(id)
  if (!pending) {
    return
  }
  for (const handle of pending) {
    window.clearTimeout(handle)
  }
  timers.delete(id)
}

function schedule(cue: CueName, generation: number): void {
  const notes = cues?.[cue]
  const bank = ensureVoices()
  if (!notes || notes.length === 0 || !bank) {
    return
  }
  clearTimers(cue)
  const handles: number[] = []
  for (const note of notes) {
    const handle = window.setTimeout(() => {
      if (cue === "fly" && generation !== flyGeneration) {
        return
      }
      const live = ensureVoices()
      if (!live) {
        return
      }
      trigger(cue, note, live)
    }, note.time * 1000)
    handles.push(handle)
  }
  timers.set(cue, handles)
}

function start(cue: CueName): void {
  const generation = cue === "fly" ? ++flyGeneration : flyGeneration
  void Tone.start()
    .then(() => loadSfx())
    .then(() => {
      if (cue === "fly" && generation !== flyGeneration) {
        return
      }
      if (Tone.getContext().state !== "running") {
        return
      }
      schedule(cue, generation)
    })
    .catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        return
      }
      report(error)
    })
}

export function playFlyBuzz(): void {
  start("fly")
}

export function stopFlyBuzz(): void {
  flyGeneration += 1
  clearTimers("fly")
  voices?.buzz.releaseAll()
}

export function playFlyHit(): void {
  start("hit")
}

export function playSwatMiss(): void {
  start("miss")
}

export function playLevelUp(): void {
  start("levelup")
}

export function playPowerOn(): void {
  start("power")
}

export function playWarp(): void {
  start("warp")
}

export function playChannelChange(): void {
  start("channel")
}

export function playChannelStatic(): void {
  start("static")
}

void loadSfx()
