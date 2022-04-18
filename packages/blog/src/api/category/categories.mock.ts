export const categoriesMock: CategoryResponse = {
  data: [
    {
      id: 1,
      attributes: {
        name: 'Sports',
        description: 'News and opinion articles on everything related to the world of sports',
        createdAt: '2022-04-15T20:01:38.459Z',
        updatedAt: '2022-04-15T20:01:38.459Z',
        code: 'SPO',
        main: true,
      },
    },
    {
      id: 2,
      attributes: {
        name: 'Music and Cinema',
        description: 'Anything related with music, cinema, theatre or other events',
        createdAt: '2022-04-15T20:04:00.311Z',
        updatedAt: '2022-04-15T20:07:08.738Z',
        code: 'MAC',
        main: true,
      },
    },
    {
      id: 3,
      attributes: {
        name: 'Engineering',
        description: 'Technology improvements and announcements',
        createdAt: '2022-04-15T20:05:00.369Z',
        updatedAt: '2022-04-15T20:07:30.237Z',
        code: 'ENG',
        main: true,
      },
    },
    {
      id: 4,
      attributes: {
        name: 'News',
        description: 'Current news around the world',
        createdAt: '2022-04-15T20:08:36.107Z',
        updatedAt: '2022-04-15T20:08:36.107Z',
        code: 'NEW',
        main: true,
      },
    },
    {
      id: 5,
      attributes: {
        name: 'History and thinking',
        description: 'Personal thoughts and historic events',
        createdAt: '2022-04-15T20:09:25.750Z',
        updatedAt: '2022-04-15T20:09:25.750Z',
        code: 'HIS',
        main: true,
      },
    },
  ],
  meta: {
    pagination: {
      page: 1,
      pageSize: 25,
      pageCount: 1,
      total: 5,
    },
  },
}
