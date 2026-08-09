const fs = require("fs");

require("dotenv").config();

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL_CA_PATH
      ? {
          ca: fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
          rejectUnauthorized: true,
          servername: process.env.DB_SSL_SERVERNAME || process.env.DB_HOST,
        }
      : undefined,
  },

  dir: "migrations",
};
