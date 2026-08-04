const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 3000,
    ssl: process.env.DATABASE_URL === 'true' ? { rejectUnauthorized: false } : false, // chấp nhận Certificate tự ký của cloud
});

pool.on('connect', ()=>{
    console.log('Connected');
})

module.exports = pool;

