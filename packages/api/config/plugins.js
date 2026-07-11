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
        defaultFrom: env('SMTP_USERNAME'),
        defaultReplyTo: env('SMTP_USERNAME'),
      },
    },
  },
  // Strapi v5 replacement for the (v4-only) @mattie-bundle search plugin.
  // Indexes posts to Algolia; index name stays `whemotion_${NODE_ENV}_post` so the
  // blog's Algolia search keeps hitting the same index.
  'strapi-algolia': {
    enabled: true,
    config: {
      apiKey: env('ALGOLIA_PROVIDER_ADMIN_API_KEY'),
      applicationId: env('ALGOLIA_PROVIDER_APPLICATION_ID'),
      indexPrefix: `whemotion_${env('NODE_ENV')}_`,
      contentTypes: [
        {
          name: 'api::post.post',
          index: 'post',
          populate: {
            categories: true,
            writer: true,
            coverImage: true,
          },
          // The editorjs `content` can be tens of KB and would push records past
          // Algolia's ~10KB record limit (silently dropping long posts from the index).
          // The blog's search never reads it, so keep it out of the index.
          hideFields: ['content'],
        },
      ],
    },
  },
  'users-permissions': {
    config: {
      jwtSecret: env('ADMIN_JWT_SECRET'),
    },
  },
})
