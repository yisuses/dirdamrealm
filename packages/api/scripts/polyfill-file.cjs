// Provide the Web `File` global on Node < 20.
//
// @softkit/strapi-plugin-react-editorjs (and one of its transitive deps) reference the
// global `File`, which only became a Node global in v20. On older Node runtimes Strapi
// fails to load the plugin config with "File is not defined". `node:buffer` has exposed
// `File` since Node 18.13, so we can backfill the global.
//
// Preloaded via NODE_OPTIONS=--require in the api npm scripts, so it runs before Strapi
// loads any plugin (and propagates to child processes).
if (typeof globalThis.File === 'undefined') {
  try {
    globalThis.File = require('node:buffer').File
  } catch {
    /* older Node without node:buffer File — nothing we can do here */
  }
}
