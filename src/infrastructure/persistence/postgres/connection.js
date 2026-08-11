const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    ssl: process.env.DATABASE_SSL === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase'))
        ? { rejectUnauthorized: false }
        : false,
});

pool.on('connect', () => {
    console.log('Connected to Postgres database');
});

module.exports = pool;

