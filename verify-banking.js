const mysql = require('mysql2/promise');

(async () => {
  const pool = await mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'tks_prepify',
  });
  const c = await pool.getConnection();

  const [paperRows] = await c.query('SELECT id, title FROM papers WHERE slug = ? LIMIT 1', ['banking']);
  if (!paperRows.length) {
    console.log('Banking paper not found (slug=banking).');
    c.release();
    await pool.end();
    return;
  }
  const paperId = Number(paperRows[0].id);
  console.log(`Banking Paper: ${paperRows[0].title} (id=${paperId})`);

  const [rows] = await c.query('SELECT difficulty, COUNT(*) as count FROM questions WHERE paper_id = ? GROUP BY difficulty', [paperId]);
  console.log('Banking Questions Distribution:');
  rows.forEach(r => console.log(`  ${r.difficulty}: ${r.count} questions`));

  const [total] = await c.query('SELECT COUNT(*) as total FROM questions WHERE paper_id = ?', [paperId]);
  console.log(`\nTotal: ${total[0].total} questions`);

  // Show first question sample
  const [sample] = await c.query('SELECT question_text, difficulty FROM questions WHERE paper_id = ? LIMIT 1', [paperId]);
  if (sample.length > 0) {
    console.log(`\nSample question: "${sample[0].question_text}"`);
    console.log(`Difficulty: ${sample[0].difficulty}`);
  }
  
  c.release();
  await pool.end();
})();
