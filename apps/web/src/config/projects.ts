export interface ProjectLink {
  label: string
  href: string
}

const VISITALAS_URL = "https://vicenteacevedolav02.github.io/visitalas.cl/"

export const projects: readonly ProjectLink[] = Array.from(
  { length: 100 },
  (_, index) => {
    if (index === 0) {
      return {
        label: "visitalas.cl",
        href: VISITALAS_URL,
      }
    }
    return {
      label: `placeholder ${index + 1}`,
      href: "#",
    }
  },
)
