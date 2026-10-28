export type ResourceStatus = "idle" | "loading" | "ready" | "error"

export interface ResourceEntry {
  id: string
  label: string
  url: string
  status: ResourceStatus
  detail?: string
}

type Listener = () => void

const entries = new Map<string, ResourceEntry>()
const listeners = new Set<Listener>()
let snapshot: readonly ResourceEntry[] = []

function emit(): void {
  snapshot = [...entries.values()]
  for (const listener of listeners) {
    listener()
  }
}

function setEntry(entry: ResourceEntry): void {
  entries.set(entry.id, entry)
  emit()
}

export function registerResource(id: string, label: string, url: string): void {
  if (entries.has(id)) {
    return
  }
  setEntry({ id, label, url, status: "idle" })
}

export function markResource(
  id: string,
  status: ResourceStatus,
  detail?: string,
): void {
  const current = entries.get(id)
  if (!current) {
    return
  }
  setEntry({ ...current, status, detail })
}

export function getResources(): readonly ResourceEntry[] {
  return snapshot
}

export function subscribeResources(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function loadImage(id: string, url: string): Promise<void> {
  markResource(id, "loading")
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      markResource(id, "ready", `${image.naturalWidth}x${image.naturalHeight}`)
      resolve()
    }
    image.onerror = () => {
      markResource(id, "error", "LOAD FAIL")
      resolve()
    }
    image.src = url
  })
}

export function preloadImages(
  assets: ReadonlyArray<{ id: string; label: string; url: string }>,
): Promise<void> {
  for (const asset of assets) {
    registerResource(asset.id, asset.label, asset.url)
  }
  return Promise.all(assets.map((asset) => loadImage(asset.id, asset.url))).then(
    () => undefined,
  )
}

export function registerMidi(id: string, label: string, url: string): void {
  registerResource(id, label, url)
  markResource(id, "loading")
}
