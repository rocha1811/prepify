const mysql = require('mysql2/promise');

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
    const [cols] = await c.query('DESCRIBE test_results');
    const hasDiff = cols.find(x => x.Field === 'difficulty');
    console.log('Has difficulty column:', !!hasDiff);
    if (!hasDiff) {
      await c.query('ALTER TABLE test_results ADD COLUMN difficulty VARCHAR(20) DEFAULT "all"');
      console.log('Added difficulty column to test_results!');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    c.release();
    await pool.end();
  }
})();
