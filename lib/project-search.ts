import type { PortfolioEntry } from "./content";
import { toProjectLink } from "./project-presentation";

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();

/** Takes an already publication-filtered index; never widens that scope. */
export function searchProjects(projects: PortfolioEntry[], { query = "", category = "", year = "" }: { query?: string; category?: string; year?: string }) {
  return projects.filter(entry => {
    const project = entry.frontmatter;
    const haystack = [project.title, project.shortTitle, project.location, ...project.roles, ...project.categories, ...(project.search_terms || [])].join(" ");
    return (!query || normalize(haystack).includes(normalize(query)))
      && (!category || project.categories.some(item => normalize(item) === normalize(category)))
      && (!year || toProjectLink(entry).year === year);
  });
}
