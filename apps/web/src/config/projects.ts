export interface ProjectLink {
  label: string
  href: string
}

export const VISITALAS_POC_URL = "https://vicenteacevedolav02.github.io/visitalas.cl/"
export const SPEEDOKU_POC_URL = "https://vicenteacevedolav02.github.io/speedoku/"

export const projects: readonly ProjectLink[] = Array.from(
  { length: 100 },
  (_, index) => {
    if (index === 0) {
      return {
        label: "visitalas.cl",
        href: "/visitalas",
      }
    }
    if (index === 1) {
      return {
        label: "speedoku",
        href: "/speedoku",
      }
    }
    return {
      label: `placeholder ${index + 1}`,
      href: "#",
    }
  },
)
