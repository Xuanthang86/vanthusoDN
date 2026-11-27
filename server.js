const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '128kb' }));
app.use(express.static(__dirname));

const reviewsStore = [];
const reviewHits = new Map();
const aiHits = new Map();

app.get('/api/reviews', (_req, res) => {
  res.json(reviewsStore);
});

app.post('/api/reviews', (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const recent = (reviewHits.get(ip) || []).filter(t => now - t < 60000);
  if (recent.length >= 5) {
    return res.status(429).json({ error: 'Too many submissions, please wait a minute.' });
  }
  recent.push(now);
  reviewHits.set(ip, recent);
  if (reviewHits.size > 1000) reviewHits.clear();

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

app.post('/api/ai/polish', async (req, res) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const recent = (aiHits.get(ip) || []).filter(t => now - t < 60000);
  if (recent.length >= 15) {
    return res.status(429).json({ error: 'Bạn gửi yêu cầu AI hơi nhanh, vui lòng đợi ít giây rồi thử lại.' });
  }
  recent.push(now);
  aiHits.set(ip, recent);
  if (aiHits.size > 1000) aiHits.clear();

  const b = req.body || {};
  const rawInfo = typeof b.rawInfo === 'string' ? b.rawInfo.slice(0, 15000) : '';
  const currentDraft = b.currentDraft && typeof b.currentDraft === 'object' ? {
    ty: typeof b.currentDraft.ty === 'string' ? b.currentDraft.ty.slice(0, 500) : '',
    cc: typeof b.currentDraft.cc === 'string' ? b.currentDraft.cc.slice(0, 4000) : '',
    nd: typeof b.currentDraft.nd === 'string' ? b.currentDraft.nd.slice(0, 15000) : ''
  } : {};

  if (!rawInfo.trim() && !currentDraft.nd.trim() && !currentDraft.ty.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập thông tin gốc hoặc nội dung nháp để AI biên tập.' });
  }

  try {
    const { polishDocumentWithAI } = await import('./ai-helper.mjs');
    const result = await polishDocumentWithAI({
      mode: b.mode === 'dang' ? 'dang' : 'nn',
      docType: typeof b.docType === 'string' ? b.docType.slice(0, 16) : 'KH',
      docTypeName: typeof b.docTypeName === 'string' ? b.docTypeName.slice(0, 80) : 'Kế hoạch',
      orgName: typeof b.orgName === 'string' ? b.orgName.slice(0, 200) : '',
      editStyle: ['polish', 'draft', 'concise'].includes(b.editStyle) ? b.editStyle : 'polish',
      rawInfo,
      currentDraft
    });
    return res.json(result);
  } catch (err) {
    const status = err && (err.statusCode || err.status);
    const httpStatus = Number.isInteger(status) && status >= 400 && status < 600 ? status : 500;
    const msg = err && err.message ? err.message : 'Không thể xử lý yêu cầu AI.';
    return res.status(httpStatus).json({ error: msg });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
