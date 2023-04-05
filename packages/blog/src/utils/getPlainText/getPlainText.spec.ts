import { DataProp } from 'editorjs-blocks-react-renderer'
import { getPlainText } from './getPlainText'

const testData: DataProp = {
  time: 1625781566709,
  blocks: [
    {
      type: 'header',
      data: {
        text: 'Header block text',
        level: 2,
      },
    },
    {
      type: 'paragraph',
      data: {
        text: 'Paragraph block text',
      },
    },
    {
      type: 'delimiter',
      data: {},
    },
    {
      type: 'list',
      data: {
        items: ['Item 1', 'Item 2', 'Item 3'],
        style: 'ordered',
      },
    },
  ],
  version: '2.19.0',
}

describe('getPlainText', () => {
  test('should return plain text for the given content', () => {
    const expectedPlainText = 'Paragraph block text'
    const plainText = getPlainText(testData)
    expect(plainText).toBe(expectedPlainText)
  })

  test('should handle empty content', () => {
    const expectedPlainText = ''
    const plainText = getPlainText({ time: 0, blocks: [], version: '2.19.0' })
    expect(plainText).toBe(expectedPlainText)
  })

  test('should strip HTML tags from the text', () => {
    const contentWithData = {
      time: 1625781566709,
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: '<b>Bold</b> text <i>Italic</i> text',
          },
        },
      ],
      version: '2.19.0',
    }
    const expectedPlainText = 'Bold text Italic text'
    const plainText = getPlainText(contentWithData)
    expect(plainText).toBe(expectedPlainText)
  })

  test('should handle content with no paragraph blocks', () => {
    const contentWithData = {
      time: 1625781566709,
      blocks: [
        {
          type: 'header',
          data: {
            text: 'Header block text',
            level: 2,
          },
        },
        {
          type: 'list',
          data: {
            items: ['Item 1', 'Item 2', 'Item 3'],
            style: 'ordered',
          },
        },
      ],
      version: '2.19.0',
    }
    const expectedPlainText = ''
    const plainText = getPlainText(contentWithData)
    expect(plainText).toBe(expectedPlainText)
  })
})
