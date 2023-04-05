import { DataProp, Block } from 'editorjs-blocks-react-renderer'
import { getReadingTime } from './getReadingTime'

const mockContent: DataProp = {
  blocks: [
    {
      type: 'paragraph',
      data: {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nulla et egestas blandit, elit leo hendrerit metus, vel elementum sapien ipsum ut urna. Donec ac metus a dolor laoreet egestas eu eu nulla.',
      },
    },
    {
      type: 'header',
      data: {
        level: 2,
        text: 'Suspendisse et lorem a massa consequat',
      },
    },
    {
      type: 'list',
      data: {
        style: 'unordered',
        items: [
          'Vivamus blandit mauris ac risus convallis, vel gravida mi aliquam.',
          'Nam suscipit erat ac enim suscipit, vitae sollicitudin ante lacinia.',
          'Ut ullamcorper velit non massa aliquam, eget tincidunt dui tristique.',
        ],
      },
    },
    {
      type: 'image',
      data: {
        file: {
          url: 'https://example.com/image.jpg',
          width: 1000,
          height: 500,
        },
      },
    },
    {
      type: 'wadus',
      data: {},
    },
  ],
  time: 0,
  version: '',
}

describe('getReadingTime function', () => {
  it('should return 0 if content is empty', () => {
    const content: DataProp = {
      blocks: [],
      time: 0,
      version: '',
    }
    const readingTime = getReadingTime(content)
    expect(readingTime).toEqual(0)
  })

  it('should return the correct reading time for a given content', () => {
    const readingTime = getReadingTime(mockContent)
    expect(readingTime).toEqual(1)
  })

  it('should return the correct when any block fails', () => {
    const readingTime = getReadingTime({
      ...mockContent,
      blocks: [...mockContent.blocks, undefined as unknown as Block],
    })
    expect(readingTime).toEqual(1)
  })
})
