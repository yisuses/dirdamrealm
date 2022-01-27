module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'wheblog'),
      user: env('DATABASE_USERNAME', 'wheblog'),
      password: env('DATABASE_PASSWORD', 'wheblog'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
})
