const express = require('express');
const db = require('./database');
const app = express();
const PORT = 3005;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===== GET ALL TASKS =====
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Database Error:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to retrieve tasks.' });
    }
    res.json({ success: true, data: rows, count: rows.length });
  });
});

// ===== GET ONE TASK =====
app.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    if (!row) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: row });
  });
});

// ===== CREATE TASK =====
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'Title must be at least 3 chars long.' });
  }
  const cleanTitle = title.trim();
  const cleanDesc = description ? description.trim() : '';
  db.run(
    'INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)',
    [cleanTitle, cleanDesc, 0],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: 'Failed to save task.' });
      const newTaskId = this.lastID;
      db.get('SELECT * FROM tasks WHERE id = ?', [newTaskId], (getErr, row) => {
        if (getErr) return res.status(500).json({ success: false, error: 'Fetch error.' });
        res.status(201).json({ success: true, data: row });
      });
    }
  );
});

// ===== COMPLETE TASK =====
app.patch('/tasks/:id/complete', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE tasks SET completed = 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'Task not found' });
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (getErr, row) => {
      if (getErr) return res.status(500).json({ success: false, error: 'Fetch error.' });
      res.json({ success: true, data: row });
    });
  });
});

// ===== DELETE TASK =====
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    if (this.changes === 0) return res.status(404).json({ success: false, error: 'Task not found' });
    res.status(204).send();
  });
});

// ===== ERROR HANDLERS =====
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Running on: http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) console.error('Error closing database:', err.message);
    else console.log('Database connection closed.');
    process.exit(0);
  });
});

