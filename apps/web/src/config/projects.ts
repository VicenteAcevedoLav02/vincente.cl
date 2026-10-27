export interface ProjectLink {
  label: string
  href: string
}

export const projects: readonly ProjectLink[] = Array.from(
  { length: 100 },
  (_, index) => ({
    label: `placeholder ${index + 1}`,
    href: "#",
  }),
)
