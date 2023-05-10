module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: env('EMAIL_USER'),
        defaultReplyTo: env('EMAIL_USER'),
      },
    },
  },
  search: {
    enabled: true,
    config: {
      provider: 'algolia',
      prefix: `whemotion_${env('NODE_ENV')}_`,
      providerOptions: {
        apiKey: env('ALGOLIA_PROVIDER_ADMIN_API_KEY'),
        applicationId: env('ALGOLIA_PROVIDER_APPLICATION_ID'),
      },
      contentTypes: [
        {
          name: 'api::post.post',
          index: 'post',
          fields: [
            'title',
            'summary',
            'categories',
            'content',
            'createdAt',
            'publishedAt',
            'locale',
            'writer',
            'coverImage',
            'imgUrl',
            'coverImageSourceUrl',
          ],
        },
      ],
    },
  },
})
