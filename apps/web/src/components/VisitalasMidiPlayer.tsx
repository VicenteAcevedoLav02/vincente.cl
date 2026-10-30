import { Midi } from "@tonejs/midi"
import { useEffect } from "react"
import * as Tone from "tone"
import { markResource, registerMidi } from "../game/resources.ts"
import { publicUrl } from "../publicUrl.ts"

const MIDI_URL = publicUrl("/music/visitalas.cl2000audio.mid")
const MIDI_ID = "visitalas.cl2000audio.mid"
const PIANO_ID = "salamander-piano"
const VOLUME_DB = -8
const PERCUSSION_CHANNEL = 9
/** Salamander Grand Piano samples (Tone.js official set). */
const PIANO_BASE = "https://tonejs.github.io/audio/salamander/"
const PIANO_URLS = {
  A0: "A0.mp3",
  C1: "C1.mp3",
  "D#1": "Ds1.mp3",
  "F#1": "Fs1.mp3",
  A1: "A1.mp3",
  C2: "C2.mp3",
  "D#2": "Ds2.mp3",
  "F#2": "Fs2.mp3",
  A2: "A2.mp3",
  C3: "C3.mp3",
  "D#3": "Ds3.mp3",
  "F#3": "Fs3.mp3",
  A3: "A3.mp3",
  C4: "C4.mp3",
  "D#4": "Ds4.mp3",
  "F#4": "Fs4.mp3",
  A4: "A4.mp3",
  C5: "C5.mp3",
  "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3",
  A5: "A5.mp3",
  C6: "C6.mp3",
  "D#6": "Ds6.mp3",
  "F#6": "Fs6.mp3",
  A6: "A6.mp3",
  C7: "C7.mp3",
  "D#7": "Ds7.mp3",
  "F#7": "Fs7.mp3",
  A7: "A7.mp3",
  C8: "C8.mp3",
} as const

function reportError(error: unknown): void {
  const message = error instanceof Error ? error.message : "Unexpected failure"
  console.error(`Visitalas MIDI: ${message}`)
}

async function createPiano(): Promise<{ volume: Tone.Volume; piano: Tone.Sampler }> {
  registerMidi(PIANO_ID, "PIANO.SMP", PIANO_BASE)
  const volume = new Tone.Volume(VOLUME_DB).toDestination()
  const piano = new Tone.Sampler({
    urls: PIANO_URLS,
    release: 1.2,
    baseUrl: PIANO_BASE,
  }).connect(volume)
  await Tone.loaded()
  markResource(PIANO_ID, "ready", "SALAMANDER")
  return { volume, piano }
}

export function VisitalasMidiPlayer() {
  useEffect(() => {
    let disposed = false
    let playbackArmed = false
    let scheduled = false
    let listening = false
    let loadingPiano = false
    let parsed: Midi | null = null
    let volume: Tone.Volume | null = null
    let piano: Tone.Sampler | null = null

    const detachInteract = () => {
      if (!listening) {
        return
      }
      listening = false
      window.removeEventListener("pointerdown", onInteract)
      window.removeEventListener("click", onInteract)
    }

    const startTransport = () => {
      if (disposed || !playbackArmed || !parsed || !scheduled) {
        return
      }
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start()
      }
    }

    const beginPlayback = () => {
      if (disposed || !playbackArmed || !parsed || scheduled || !piano) {
        return
      }

      const tempo = parsed.header.tempos[0]?.bpm
      if (typeof tempo === "number" && Number.isFinite(tempo) && tempo > 0) {
        Tone.Transport.bpm.value = tempo
      }

      Tone.Transport.loop = true
      Tone.Transport.loopStart = 0
      Tone.Transport.loopEnd = Math.max(parsed.duration, 0.1)

      let notes = 0
      for (const track of parsed.tracks) {
        if (track.channel === PERCUSSION_CHANNEL || track.instrument.percussion) {
          continue
        }
        for (const note of track.notes) {
          if (note.duration <= 0 || !Number.isFinite(note.time)) {
            continue
          }
          const name = note.name
          const when = note.time
          const duration = note.duration
          const velocity = Math.min(1, Math.max(0, note.velocity))
          Tone.Transport.schedule((time) => {
            if (disposed || !piano) {
              return
            }
            piano.triggerAttackRelease(name, duration, time, velocity)
          }, when)
          notes += 1
        }
      }

      if (notes === 0) {
        console.error("Visitalas MIDI: no playable piano notes")
        return
      }

      scheduled = true
      startTransport()
    }

    const attemptPlay = () => {
      if (disposed) {
        return
      }
      void Tone.start()
        .then(async () => {
          if (disposed) {
            return
          }
          if (Tone.getContext().state !== "running") {
            attachInteract()
            return
          }
          detachInteract()
          playbackArmed = true

          if (!piano || !volume) {
            if (loadingPiano) {
              return
            }
            loadingPiano = true
            try {
              const voices = await createPiano()
              if (disposed) {
                voices.piano.dispose()
                voices.volume.dispose()
                return
              }
              volume = voices.volume
              piano = voices.piano
            } catch (error: unknown) {
              markResource(PIANO_ID, "error", "LOAD FAIL")
              reportError(error)
              return
            } finally {
              loadingPiano = false
            }
          }

          beginPlayback()
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            attachInteract()
            return
          }
          reportError(error)
          attachInteract()
        })
    }

    function onInteract() {
      playbackArmed = true
      attemptPlay()
    }

    function attachInteract() {
      if (listening || disposed) {
        return
      }
      listening = true
      window.addEventListener("pointerdown", onInteract)
      window.addEventListener("click", onInteract)
    }

    attachInteract()

    const load = async () => {
      registerMidi(MIDI_ID, "VISITALAS.MID", MIDI_URL)
      try {
        const midi = await Midi.fromUrl(MIDI_URL)
        if (disposed) {
          return
        }
        parsed = midi
        markResource(
          MIDI_ID,
          "ready",
          `${midi.tracks.length} TRK ${midi.duration.toFixed(1)}S`,
        )
        attemptPlay()
      } catch (error: unknown) {
        markResource(MIDI_ID, "error", "LOAD FAIL")
        reportError(error)
      }
    }

    void load()

    return () => {
      disposed = true
      detachInteract()
      Tone.Transport.stop()
      Tone.Transport.cancel(0)
      Tone.Transport.loop = false
      piano?.releaseAll()
      piano?.dispose()
      volume?.dispose()
      piano = null
      volume = null
    }
  }, [])

  return null
}
