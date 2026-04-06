const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = await mysql.createPool({
    host: process.env.SQL_HOST || '127.0.0.1',
    user: process.env.SQL_USER || 'root',
    password: process.env.SQL_PASSWORD || '',
    database: process.env.SQL_DATABASE || 'tks_prepify',
    port: Number(process.env.SQL_PORT || 3306),
  });
  const c = await pool.getConnection();
  try {
    const [cols] = await c.query('DESCRIBE questions');
    const hasDiff = cols.find(x => x.Field === 'difficulty');
    console.log('Has difficulty column:', !!hasDiff);
    if (!hasDiff) {
      await c.query('ALTER TABLE questions ADD COLUMN difficulty VARCHAR(20) DEFAULT "medium"');
      console.log('Added difficulty column!');
    }
  } catch (e) {
    console.error(e.message);
  } finally {
    c.release();
    await pool.end();
  }
})();
