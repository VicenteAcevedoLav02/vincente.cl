export interface Point {
  x: number
  y: number
}

const EDGES = 4

function outsidePoint(edge: number, width: number, height: number, pad: number): Point {
  const alongX = Math.random() * width
  const alongY = Math.random() * height
  if (edge === 0) {
    return { x: alongX, y: -pad }
  }
  if (edge === 1) {
    return { x: width + pad, y: alongY }
  }
  if (edge === 2) {
    return { x: alongX, y: height + pad }
  }
  return { x: -pad, y: alongY }
}

function insidePoint(width: number, height: number, inset: number): Point {
  const spanX = Math.max(1, width - inset * 2)
  const spanY = Math.max(1, height - inset * 2)
  return {
    x: inset + Math.random() * spanX,
    y: inset + Math.random() * spanY,
  }
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

export function createFlyPath(width: number, height: number): Point[] {
  const inset = Math.max(24, Math.min(80, width * 0.14, height * 0.14))
  const pad = 56
  const startEdge = Math.floor(Math.random() * EDGES)
  let endEdge = Math.floor(Math.random() * (EDGES - 1))
  if (endEdge >= startEdge) {
    endEdge += 1
  }
  return [
    outsidePoint(startEdge, width, height, pad),
    insidePoint(width, height, inset),
    insidePoint(width, height, inset),
    insidePoint(width, height, inset),
    outsidePoint(endEdge, width, height, pad),
  ]
}

export function pointOnPath(points: readonly Point[], progress: number): Point {
  const first = points[0]
  if (!first) {
    return { x: 0, y: 0 }
  }
  const last = points[points.length - 1] ?? first
  if (points.length === 1 || progress <= 0) {
    return first
  }
  if (progress >= 1) {
    return last
  }
  const scaled = progress * (points.length - 1)
  const index = Math.min(points.length - 2, Math.floor(scaled))
  const from = points[index] ?? first
  const to = points[index + 1] ?? last
  const local = smooth(scaled - index)
  return {
    x: from.x + (to.x - from.x) * local,
    y: from.y + (to.y - from.y) * local,
  }
}
