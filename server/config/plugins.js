module.exports = ({ env }) => ({
  ratings: {
    enabled: true,
    resolve: "./src/plugins/ratings",
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: env("MAIL_USER"),
          clientId: env("MAIL_CLIENT_ID"),
          clientSecret: env("MAIL_CLIENT_SECRET"),
          refreshToken: env("MAIL_REFRESH_TOKEN"),
        },
      },
      settings: {
        defaultFrom: env("MAIL_DEFAULT_FROM", "email@gmail.com"),
        defaultReplyTo: env("MAIL_DEFAULT_REPLY_TO", "email@gmail.com"),
      },
    },
  },
  'import-export-entries': {
    enabled: true,
  },
  // ...
});
