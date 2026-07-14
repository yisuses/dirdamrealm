/* eslint-env browser */
export default {
  config: {
    locales: [],
  },
  bootstrap() {
    // The EditorJS admin field renders its content quite small and in a narrow
    // centred column. Bump the typography and widen the editing area so authors
    // can read what they write.
    const style = document.createElement('style')
    style.setAttribute('data-whe', 'editorjs-typography')
    style.innerHTML = `
      .codex-editor .ce-block__content,
      .codex-editor .ce-toolbar__content {
        max-width: 900px;
      }
      .codex-editor .ce-paragraph,
      .codex-editor .cdx-block,
      .codex-editor .ce-block {
        font-size: 16px;
        line-height: 1.7;
      }
      .codex-editor h1.ce-header { font-size: 2rem; line-height: 1.3; }
      .codex-editor h2.ce-header { font-size: 1.6rem; line-height: 1.3; }
      .codex-editor h3.ce-header { font-size: 1.3rem; line-height: 1.3; }
    `
    document.head.appendChild(style)
  },
}
