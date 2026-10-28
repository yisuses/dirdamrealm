/* eslint-disable @typescript-eslint/naming-convention -- EditorJS's messages are keyed by their English text */
import type { I18nDictionary } from '@editorjs/editorjs'

/** EditorJS's interface in Spanish: the toolbox, menus and every tool the editor offers. */
export const editorMessages: I18nDictionary = {
  ui: {
    blockTunes: {
      toggler: { 'Click to tune': 'Pulsa para ver opciones', 'or drag to move': 'o arrastra para moverlo' },
    },
    inlineToolbar: { converter: { 'Convert to': 'Convertir en' } },
    toolbar: { toolbox: { Add: 'Añadir' } },
    popover: { Filter: 'Buscar', 'Nothing found': 'No hay nada', 'Convert to': 'Convertir en' },
  },
  toolNames: {
    Text: 'Párrafo',
    Heading: 'Título de sección',
    'Unordered List': 'Lista con puntos',
    'Ordered List': 'Lista numerada',
    Quote: 'Cita',
    Image: 'Imagen',
    Link: 'Enlace',
    Delimiter: 'Separador',
    Table: 'Tabla',
    Code: 'Código',
    Bold: 'Negrita',
    Italic: 'Cursiva',
  },
  tools: {
    link: { 'Add a link': 'Pega o escribe un enlace' },
    stub: { 'The block can not be displayed correctly.': 'Este bloque no se puede mostrar.' },
    header: { 'Heading 2': 'Título grande', 'Heading 3': 'Título pequeño' },
    list: { Unordered: 'Con puntos', Ordered: 'Numerada' },
    table: {
      'With headings': 'Con encabezados',
      'Without headings': 'Sin encabezados',
      'Add column to left': 'Añadir columna a la izquierda',
      'Add column to right': 'Añadir columna a la derecha',
      'Delete column': 'Borrar columna',
      'Add row above': 'Añadir fila encima',
      'Add row below': 'Añadir fila debajo',
      'Delete row': 'Borrar fila',
    },
    embed: { 'Enter a caption': 'Pie del vídeo (opcional)' },
    LinkTool: {
      Link: 'Enlace',
      "Couldn't fetch the link data": 'No se ha podido leer esa página',
      "Couldn't get this link data, try the other one": 'No se ha podido leer ese enlace; prueba con otro',
      'Wrong response format from the server': 'No se ha podido leer esa página',
    },
  },
  blockTunes: {
    delete: { Delete: 'Borrar', 'Click to delete': 'Pulsa otra vez para borrar' },
    moveUp: { 'Move up': 'Subir' },
    moveDown: { 'Move down': 'Bajar' },
  },
}
