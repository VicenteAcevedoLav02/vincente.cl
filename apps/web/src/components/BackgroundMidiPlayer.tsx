import { Midi, type Track } from "@tonejs/midi"
import { useEffect } from "react"
import * as Tone from "tone"

import { publicUrl } from "../publicUrl.ts"

const MIDI_URL = publicUrl("/music/ambient.mid")
const VOLUME_DB = -14
const PERCUSSION_CHANNEL = 9

type TrackRole = "lead" | "harmony" | "bass" | "percussion"

interface PlayableNote {
  name: string
  midi: number
  time: number
  duration: number
  velocity: number
}

interface RoutedTrack {
  role: TrackRole
  notes: PlayableNote[]
}

interface VoiceBank {
  volume: Tone.Volume
  lead: Tone.PolySynth | null
  harmony: Tone.PolySynth | null
  bass: Tone.Synth | null
  bassFilter: Tone.Filter | null
  drums: Tone.NoiseSynth[]
}

const LEAD_NAME = /lead|melody|solo|theme|main/
const HARMONY_NAME = /harm|counter|pad|chord|accomp|arp|echo/
const BASS_NAME = /bass/
const DRUM_NAME = /drum|perc|noise|kit|snare|hat/

function reportMidiError(error: unknown): void {
  const message = error instanceof Error ? error.message : "Unexpected failure"
  console.error(`Background MIDI: ${message}`)
}

function clampVelocity(velocity: number): number {
  return Math.min(1, Math.max(0, velocity))
}

function playableNotes(track: Track): PlayableNote[] {
  return track.notes
    .filter((note) => note.duration > 0 && Number.isFinite(note.time))
    .map((note) => ({
      name: note.name,
      midi: note.midi,
      time: note.time,
      duration: note.duration,
      velocity: clampVelocity(note.velocity),
    }))
}

function averageMidi(notes: PlayableNote[]): number {
  const total = notes.reduce((sum, note) => sum + note.midi, 0)
  return total / notes.length
}

function isPercussionTrack(track: Track): boolean {
  const name = track.name.toLowerCase()
  return (
    track.channel === PERCUSSION_CHANNEL ||
    track.instrument.percussion ||
    track.instrument.family.toLowerCase() === "drums" ||
    DRUM_NAME.test(name)
  )
}

function namedRole(track: Track, notes: PlayableNote[]): TrackRole | null {
  const name = track.name.toLowerCase()
  const family = track.instrument.family.toLowerCase()
  if (isPercussionTrack(track)) {
    return "percussion"
  }
  if (BASS_NAME.test(name) || family.includes("bass") || averageMidi(notes) < 48) {
    return "bass"
  }
  if (HARMONY_NAME.test(name)) {
    return "harmony"
  }
  if (LEAD_NAME.test(name)) {
    return "lead"
  }
  return null
}

function routeTracks(tracks: Track[]): RoutedTrack[] {
  const candidates = tracks
    .map((track) => ({ track, notes: playableNotes(track) }))
    .filter((candidate) => candidate.notes.length > 0)

  const named = candidates.map((candidate) => ({
    ...candidate,
    role: namedRole(candidate.track, candidate.notes),
  }))
  const hasLead = named.some((candidate) => candidate.role === "lead")
  let fallbackLeadAssigned = hasLead

  return named.map((candidate) => {
    if (candidate.role) {
      return { role: candidate.role, notes: candidate.notes }
    }
    if (!fallbackLeadAssigned) {
      fallbackLeadAssigned = true
      return { role: "lead", notes: candidate.notes }
    }
    return { role: "harmony", notes: candidate.notes }
  })
}

function percussionDuration(midiNote: number): number {
  if (midiNote >= 49) {
    return 0.05
  }
  if (midiNote >= 42) {
    return 0.035
  }
  if (midiNote >= 38) {
    return 0.09
  }
  return 0.13
}

function createVoices(roles: ReadonlySet<TrackRole>): VoiceBank {
  const volume = new Tone.Volume(VOLUME_DB).toDestination()
  const lead = roles.has("lead")
    ? new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.1,
        },
      }).connect(volume)
    : null
  const harmony = roles.has("harmony")
    ? new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.02,
          decay: 0.14,
          sustain: 0.4,
          release: 0.2,
        },
      }).connect(volume)
    : null

  let bass: Tone.Synth | null = null
  let bassFilter: Tone.Filter | null = null
  if (roles.has("bass")) {
    bassFilter = new Tone.Filter({
      type: "lowpass",
      frequency: 140,
      Q: 8,
      rolloff: -12,
    }).connect(volume)
    bass = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: {
        attack: 0.005,
        decay: 0.16,
        sustain: 0.2,
        release: 0.08,
      },
    }).connect(bassFilter)
  }

  const drums = roles.has("percussion")
    ? Array.from({ length: 4 }, () =>
        new Tone.NoiseSynth({
          noise: { type: "white" },
          envelope: {
            attack: 0.001,
            decay: 0.06,
            sustain: 0,
            release: 0.02,
          },
        }).connect(volume),
      )
    : []

  return { volume, lead, harmony, bass, bassFilter, drums }
}

function scheduleRoutedTracks(
  routed: RoutedTrack[],
  voices: VoiceBank,
  isDisposed: () => boolean,
): void {
  let drumVoice = 0

  for (const track of routed) {
    for (const note of track.notes) {
      const { name, midi, time: when, duration, velocity } = note
      if (track.role === "percussion" && voices.drums.length > 0) {
        const burst = percussionDuration(midi)
        const drums = voices.drums[drumVoice % voices.drums.length]
        drumVoice += 1
        if (!drums) {
          continue
        }
        Tone.Transport.schedule((time) => {
          if (isDisposed()) {
            return
          }
          drums.triggerAttackRelease(burst, time, velocity)
        }, when)
        continue
      }
      if (track.role === "bass" && voices.bass && voices.bassFilter) {
        const bass = voices.bass
        const filter = voices.bassFilter
        Tone.Transport.schedule((time) => {
          if (isDisposed()) {
            return
          }
          filter.frequency.cancelScheduledValues(time)
          filter.frequency.setValueAtTime(900, time)
          filter.frequency.exponentialRampToValueAtTime(140, time + 0.09)
          bass.triggerAttackRelease(name, duration, time, velocity)
        }, when)
        continue
      }
      const synth = track.role === "lead" ? voices.lead : voices.harmony
      if (!synth) {
        continue
      }
      Tone.Transport.schedule((time) => {
        if (isDisposed()) {
          return
        }
        synth.triggerAttackRelease(name, duration, time, velocity)
      }, when)
    }
  }
}

function disposeVoices(voices: VoiceBank | null): void {
  if (!voices) {
    return
  }
  voices.lead?.releaseAll()
  voices.harmony?.releaseAll()
  voices.bass?.triggerRelease()
  for (const drum of voices.drums) {
    drum.triggerRelease()
  }
  voices.lead?.dispose()
  voices.harmony?.dispose()
  voices.bass?.dispose()
  voices.bassFilter?.dispose()
  for (const drum of voices.drums) {
    drum.dispose()
  }
  voices.volume.dispose()
}

export function BackgroundMidiPlayer() {
  useEffect(() => {
    let disposed = false
    let playbackArmed = false
    let scheduling = false
    let scheduled = false
    let listening = false
    let parsed: Midi | null = null
    let voices: VoiceBank | null = null

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
      if (disposed || !playbackArmed || !parsed || scheduled || scheduling) {
        return
      }

      const routed = routeTracks(parsed.tracks)
      if (routed.length === 0 || parsed.duration <= 0) {
        console.error("Background MIDI: file has no playable notes")
        return
      }

      scheduling = true

      const tempo = parsed.header.tempos[0]?.bpm
      if (typeof tempo === "number" && Number.isFinite(tempo) && tempo > 0) {
        Tone.Transport.bpm.value = tempo
      }

      Tone.Transport.loop = true
      Tone.Transport.loopStart = 0
      Tone.Transport.loopEnd = parsed.duration

      voices = createVoices(new Set(routed.map((track) => track.role)))
      scheduleRoutedTracks(routed, voices, () => disposed)
      scheduled = true
      startTransport()
    }

    const attemptPlay = () => {
      if (disposed) {
        return
      }
      void Tone.start()
        .then(() => {
          if (disposed) {
            return
          }
          if (Tone.getContext().state !== "running") {
            attachInteract()
            return
          }
          detachInteract()
          playbackArmed = true
          beginPlayback()
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            attachInteract()
            return
          }
          reportMidiError(error)
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
      try {
        const midi = await Midi.fromUrl(MIDI_URL)
        if (disposed) {
          return
        }
        parsed = midi
        attemptPlay()
      } catch (error: unknown) {
        reportMidiError(error)
      }
    }

    void load()

    return () => {
      disposed = true
      detachInteract()
      Tone.Transport.stop()
      Tone.Transport.cancel(0)
      Tone.Transport.loop = false
      disposeVoices(voices)
      voices = null
    }
  }, [])

  return null
}