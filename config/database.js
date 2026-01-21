const { parse } = require('pg-connection-string');

module.exports = ({ env }) => {
  // SEMPRE usar PostgreSQL, NUNCA SQLite
  const config = parse(env('DATABASE_URL'));
  
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: { rejectUnauthorized: false },
      },
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 30000,
      },
    },
  };
};
