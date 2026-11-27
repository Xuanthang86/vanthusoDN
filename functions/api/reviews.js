/* Cloudflare Pages Function cho /api/reviews (hỗ trợ lưu KV nếu gắn binding REVIEWS_KV) */
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

export async function onRequestGet({ env }) {
  try {
    if (env && env.REVIEWS_KV) {
      const raw = await env.REVIEWS_KV.get('reviews_list');
      const list = raw ? JSON.parse(raw) : [];
      return json(Array.isArray(list) ? list : []);
    }
    return json([]);
  } catch {
    return json([]);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json();
    const stars = Number(b && b.stars);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return json({ error: 'Invalid stars rating' }, 400);
    }
    const tags = Array.isArray(b.tags)
      ? b.tags.filter(t => typeof t === 'string').slice(0, 15).map(t => t.slice(0, 120))
      : [];
    const note = typeof b.note === 'string' ? b.note.trim().slice(0, 500) : '';
    const item = {
      id: typeof b.id === 'string' ? b.id.slice(0, 64) : `rv-${Date.now()}`,
      stars,
      tags,
      note,
      ts: Number(b.ts) || Date.now()
    };

    if (env && env.REVIEWS_KV) {
      const raw = await env.REVIEWS_KV.get('reviews_list');
      const list = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(list) ? list : [];
      next.unshift(item);
      if (next.length > 200) next.length = 200;
      await env.REVIEWS_KV.put('reviews_list', JSON.stringify(next));
    }

    return json(item, 201);
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }
}
