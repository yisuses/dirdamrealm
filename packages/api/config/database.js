module.exports = ({ env }) => {
  const enableSSL = env.bool('DATABASE_SSL', false)

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'wheblog'),
        user: env('DATABASE_USERNAME', 'wheblog'),
        password: env('DATABASE_PASSWORD', 'wheblog'),
        ...(enableSSL
          ? {
              ssl: {
                rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
              },
            }
          : { ssl: false }),
      },
    },
  }
}
