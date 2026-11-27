/* Cloudflare Pages Function cho /api/visits (lưu KV nếu gắn binding REVIEWS_KV) */
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
      const raw = await env.REVIEWS_KV.get('visits_count');
      const visits = Math.max(0, parseInt(raw || '0', 10) || 0);
      return json({ visits });
    }
    return json({ visits: 0 });
  } catch {
    return json({ visits: 0 });
  }
}

export async function onRequestPost({ env }) {
  try {
    if (env && env.REVIEWS_KV) {
      const raw = await env.REVIEWS_KV.get('visits_count');
      const next = Math.max(0, parseInt(raw || '0', 10) || 0) + 1;
      await env.REVIEWS_KV.put('visits_count', String(next));
      return json({ visits: next });
    }
    return json({ visits: 0 });
  } catch {
    return json({ visits: 0 });
  }
}
