export const titleLetters = [
  "V",
  "I",
  "N",
  "C",
  "E",
  "N",
  "T",
  "E",
  ".",
  "C",
  "L",
] as const

/** One bright color per letter. Edit this list to recolor the title. */
export const letterColors = [
  "#FF2A2A",
  "#FF8A00",
  "#FFE600",
  "#14C46A",
  "#00D4E8",
  "#2F6BFF",
  "#8B3DFF",
  "#FF2D95",
  "#FF2A2A",
  "#FF8A00",
  "#14C46A",
] as const

/**
 * What each letter does on click, keyed by its index in `titleLetters`.
 * Replace a function to navigate, open a modal, or anything else later.
 */
export const letterActions: Record<number, () => void> = {
  0: () => console.log("Clicked V at index 0"),
  1: () => console.log("Clicked I at index 1"),
  2: () => console.log("Clicked N at index 2"),
  3: () => console.log("Clicked C at index 3"),
  4: () => console.log("Clicked E at index 4"),
  5: () => console.log("Clicked N at index 5"),
  6: () => console.log("Clicked T at index 6"),
  7: () => console.log("Clicked E at index 7"),
  8: () => console.log("Clicked . at index 8"),
  9: () => console.log("Clicked C at index 9"),
  10: () => console.log("Clicked L at index 10"),
}
