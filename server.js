const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '64kb' }));
app.use(express.static(__dirname));

const reviewsStore = [];

app.get('/api/reviews', (_req, res) => {
  res.json(reviewsStore);
});

app.post('/api/reviews', (req, res) => {
  const b = req.body || {};
  const stars = Number(b.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Invalid stars rating' });
  }
  const tags = Array.isArray(b.tags) ? b.tags.filter(t => typeof t === 'string').slice(0, 15).map(t => t.slice(0, 120)) : [];
  const note = typeof b.note === 'string' ? b.note.trim().slice(0, 500) : '';
  const item = {
    id: typeof b.id === 'string' ? b.id.slice(0, 64) : `rv-${Date.now()}`,
    stars,
    tags,
    note,
    ts: Number(b.ts) || Date.now()
  };
  reviewsStore.unshift(item);
  if (reviewsStore.length > 200) reviewsStore.length = 200;
  return res.status(201).json(item);
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
