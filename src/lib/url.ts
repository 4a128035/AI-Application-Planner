/** Prefix a site path with the GitHub Pages base, e.g. url('l11/') → '/AI-Application-Planner/l11/'. */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}
