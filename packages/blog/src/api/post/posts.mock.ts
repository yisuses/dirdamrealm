export const lastPost: PostResponse = {
  data: [
    {
      id: 2,
      attributes: {
        title_en: 'A new travel agency',
        title_es: 'A new travel agency',
        summary_en: 'This is the beginning of my new business, now I venture to organize trips and safaris',
        summary_es: 'This is the beginning of my new business, now I venture to organize trips and safaris',
        content_en: '',
        content_es: '',
        imgUrl:
          'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=868&q=80',
        createdAt: '2022-04-23T18:52:26.557Z',
        updatedAt: '2022-04-23T18:52:26.557Z',
        publishedAt: '2022-04-23T18:52:26.557Z',
        categories: {
          data: [
            {
              id: 4,
              attributes: {
                name: 'News',
                description: 'Current news arround the World',
                createdAt: '2022-04-15T20:08:36.107Z',
                updatedAt: '2022-04-15T20:08:36.107Z',
                code: 'NEW',
                main: true,
              },
            },
            {
              id: 6,
              attributes: {
                name: 'Travel',
                description: 'Travels',
                createdAt: '2022-04-23T18:50:46.411Z',
                updatedAt: '2022-04-23T18:50:46.411Z',
                code: 'TRA',
                main: false,
              },
            },
          ],
        },
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 1,
      pageCount: 2,
      total: 2,
    },
  },
}
