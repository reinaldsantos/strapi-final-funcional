const path = require('path');

module.exports = ({ env }) => {
  // PostgreSQL do Render (produção e desenvolvimento)
  if (env('DATABASE_URL')) {
    const url = new URL(env('DATABASE_URL'));
    
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: url.hostname,
          port: url.port || 5432,
          database: url.pathname.substring(1),
          user: url.username,
          password: url.password,
          ssl: env.bool('DATABASE_SSL', true) ? {
            rejectUnauthorized: false
          } : false
        },
        pool: {
          min: 0,
          max: 10,
          acquireTimeoutMillis: 60000,
          createTimeoutMillis: 60000,
          destroyTimeoutMillis: 60000,
          idleTimeoutMillis: 60000,
          reapIntervalMillis: 1000,
          createRetryIntervalMillis: 100
        }
      },
    };
  }

  // Fallback para SQLite (apenas se não tiver DATABASE_URL)
  console.log('??  Usando SQLite local (sem DATABASE_URL)');
  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '.tmp', 'local.db'),
      },
      useNullAsDefault: true,
    },
  };
};
