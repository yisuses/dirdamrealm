export function stripTags(str: string): string {
  return str
    .replace(/(<([^>]+)>)/gi, ' ')
    .replace(/  +/g, ' ')
    .trim()
}
