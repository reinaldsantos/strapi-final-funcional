// config/database.js - BLOQUEIA MIGRAÇÕES COMPLETAMENTE
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 0, max: 5 },
    acquireConnectionTimeout: 600000,
    migrations: {
      enabled: false,  // ← DESLIGA MIGRAÇÕES
    },
  },
});
