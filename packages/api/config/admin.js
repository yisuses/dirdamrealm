module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '8fdca380e63a61701375362736d129df'),
  },
})
