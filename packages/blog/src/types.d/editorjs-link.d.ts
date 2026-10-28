// `@editorjs/link` ships without type declarations, and `@editorjs/embed`'s are not reachable
// through its package.json `exports`.
declare module '@editorjs/link' {
  import type { BlockToolConstructable } from '@editorjs/editorjs'

  const LinkTool: BlockToolConstructable
  export default LinkTool
}

declare module '@editorjs/embed' {
  import type { BlockToolConstructable } from '@editorjs/editorjs'

  const Embed: BlockToolConstructable
  export default Embed
}
