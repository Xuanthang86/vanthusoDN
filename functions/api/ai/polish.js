/* Cloudflare Pages Function cho /api/ai/polish
 * Hỗ trợ nhiều công cụ AI thông qua biến môi trường trên Cloudflare Pages:
 * - Google Gemini (GEMINI_API_KEY)
 * - ChatGPT / OpenAI (OPENAI_API_KEY)
 * - Claude / Anthropic (ANTHROPIC_API_KEY)
 * - Groq (GROQ_API_KEY)
 * - Cloudflare Workers AI (binding AI)
 */
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...CORS_HEADERS
    }
  });

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ env }) {
  return json({
    providers: {
      free_auto: true,
      gemini: Boolean(env && env.GEMINI_API_KEY),
      openai: Boolean(env && env.OPENAI_API_KEY),
      claude: Boolean(env && env.ANTHROPIC_API_KEY),
      groq: Boolean(env && env.GROQ_API_KEY),
      workers_ai: Boolean(env && env.AI)
    }
  });
}

function buildPrompts({ mode = 'nn', docType = 'KH', docTypeName = 'Kế hoạch', orgName = '', editStyle = 'polish', rawInfo = '', currentDraft = {} }) {
  const isState = mode !== 'dang';
  const styleDesc =
    editStyle === 'draft'
      ? 'Chuyển hóa các ghi chú thô / thông tin gốc thành văn bản hành chính hoàn chỉnh, chia mục hợp lý theo loại văn bản.'
      : editStyle === 'concise'
      ? 'Rút gọn câu từ thật cô đọng, súc tích, bỏ hoàn toàn từ ngữ rườm rà và ý trùng lặp nhưng vẫn giữ đủ nội dung chính.'
      : 'Biên tập lại câu từ cho suôn mượt, mạch lạc, chuẩn văn phong hành chính, gộp và loại bỏ mọi câu/ý bị lặp lại.';

  const systemInstruction = [
    'Bạn là chuyên gia văn thư - lưu trữ hành chính Việt Nam, am hiểu sâu Nghị định 30/2020/NĐ-CP (Khối Chính quyền) và Hướng dẫn 05-HD/VPTW (Khối Đảng).',
    `Chế độ hiện tại: ${isState ? "Khối Chính quyền (NĐ 30/2020/NĐ-CP) - BẮT BUỘC viết 'Ủy'/'ủy'." : "Khối Đảng (HD 05-HD/VPTW) - BẮT BUỘC viết 'Uỷ'/'uỷ', trích yếu viết thường chữ cái đầu."}`,
    `Loại văn bản đang soạn: ${docTypeName} (mã ${docType}).`,
    orgName ? `Cơ quan ban hành: ${orgName}.` : '',
    `Yêu cầu biên tập: ${styleDesc}`,
    'Nguyên tắc: văn phong hành chính công vụ Việt Nam, câu từ suôn mượt, gọn gàng, không lặp nội dung; giữ nguyên số liệu/ngày tháng/tên riêng gốc; không đưa Quốc hiệu/Số/Nơi nhận/Chữ ký vào phần nd; kết thúc nd bằng ./.',
    'Trả về duy nhất JSON hợp lệ gồm 4 khóa: ty (string), cc (string[]), nd (string), summary (string).'
  ].filter(Boolean).join('\n');

  const parts = [];
  if (rawInfo && rawInfo.trim()) parts.push('=== THÔNG TIN GỐC ===\n' + rawInfo.trim());
  if (currentDraft && (currentDraft.ty || currentDraft.cc || currentDraft.nd)) {
    parts.push(
      '=== BẢN NHÁP HIỆN CÓ ===\n' +
        (currentDraft.ty ? `Trích yếu: ${currentDraft.ty}\n` : '') +
        (currentDraft.cc ? `Căn cứ:\n${currentDraft.cc}\n` : '') +
        (currentDraft.nd ? `Nội dung:\n${currentDraft.nd}` : '')
    );
  }
  if (!parts.length) parts.push(`Hãy gợi ý nội dung mẫu hoàn chỉnh cho loại văn bản ${docTypeName}.`);

  return { systemInstruction, contents: parts.join('\n\n') };
}

function normalizeOut(parsed, provider) {
  return {
    ty: String(parsed.ty || '').trim(),
    cc: Array.isArray(parsed.cc) ? parsed.cc.map(x => String(x).trim()).filter(Boolean) : [],
    nd: String(parsed.nd || '').trim(),
    summary: String(parsed.summary || '').trim(),
    provider
  };
}

function extractJson(text) {
  const s = String(text || '').trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse((fenced ? fenced[1] : s).trim());
}

async function runGemini(env, { systemInstruction, contents }) {
  if (!env || !env.GEMINI_API_KEY) return null;
  const models = [env.GEMINI_MODEL || 'gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
  let lastStatus = 500;
  let lastData = null;
  for (const model of models) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: contents }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                ty: { type: 'STRING' },
                cc: { type: 'ARRAY', items: { type: 'STRING' } },
                nd: { type: 'STRING' },
                summary: { type: 'STRING' }
              },
              required: ['ty', 'cc', 'nd', 'summary']
            }
          }
        })
      }
    );
    const data = await resp.json();
    if (resp.ok) {
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { ok: true, data: normalizeOut(extractJson(txt), `Google Gemini (${model})`) };
    }
    lastStatus = resp.status;
    lastData = data;
    if (resp.status !== 404) break;
  }
  return { ok: false, status: lastStatus, error: lastData?.error?.message || `Lỗi Gemini API (${lastStatus}).` };
}

async function runOpenAI(env, { systemInstruction, contents }) {
  if (!env || !env.OPENAI_API_KEY) return null;
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: contents }
      ]
    })
  });
  const data = await resp.json();
  if (!resp.ok) {
    return { ok: false, status: resp.status, error: data?.error?.message || `Lỗi ChatGPT / OpenAI (${resp.status}).` };
  }
  const txt = data?.choices?.[0]?.message?.content || '';
  return { ok: true, data: normalizeOut(extractJson(txt), `ChatGPT (${model})`) };
}

async function runClaude(env, { systemInstruction, contents }) {
  if (!env || !env.ANTHROPIC_API_KEY) return null;
  const model = env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemInstruction,
      messages: [{ role: 'user', content: contents }]
    })
  });
  const data = await resp.json();
  if (!resp.ok) {
    return { ok: false, status: resp.status, error: data?.error?.message || `Lỗi Claude / Anthropic (${resp.status}).` };
  }
  const txt = (data?.content || []).map(b => b?.text || '').join('');
  return { ok: true, data: normalizeOut(extractJson(txt), `Claude (${model})`) };
}

async function runGroq(env, { systemInstruction, contents }) {
  if (!env || !env.GROQ_API_KEY) return null;
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: contents }
      ]
    })
  });
  const data = await resp.json();
  if (!resp.ok) {
    return { ok: false, status: resp.status, error: data?.error?.message || `Lỗi Groq API (${resp.status}).` };
  }
  const txt = data?.choices?.[0]?.message?.content || '';
  return { ok: true, data: normalizeOut(extractJson(txt), 'Groq Llama 3.3') };
}

async function runWorkersAI(env, { systemInstruction, contents }) {
  if (!env || !env.AI) return null;
  const out = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: contents }
    ]
  });
  const txt = out?.response || '';
  return { ok: true, data: normalizeOut(extractJson(txt), 'Cloudflare Workers AI') };
}

async function runPollinationsFree(_env, { systemInstruction, contents }) {
  const resp = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      private: true,
      jsonMode: true,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: contents }
      ]
    })
  });
  const txt = await resp.text();
  if (!resp.ok) {
    let msg = `AI miễn phí đang tạm bận (${resp.status}).`;
    try {
      const parsed = JSON.parse(txt);
      if (parsed?.error?.code === 'FREE_LIMIT') {
        msg = 'AI tự động đang tạm giới hạn lượt liên tiếp. Hãy thử lại sau ít giây hoặc kết nối công cụ AI trực tiếp trên trang.';
      } else if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch (_) {}
    return { ok: false, status: resp.status === 402 ? 429 : resp.status, error: msg };
  }
  return { ok: true, data: normalizeOut(extractJson(txt), 'AI Tự động (Miễn phí)') };
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const rawInfo = typeof body?.rawInfo === 'string' ? body.rawInfo.slice(0, 15000) : '';
    const currentDraft = body?.currentDraft || {};
    if (!rawInfo.trim() && !String(currentDraft.nd || '').trim() && !String(currentDraft.ty || '').trim()) {
      return json({ error: 'Vui lòng nhập thông tin gốc hoặc nội dung nháp để AI biên tập.' }, 400);
    }

    const prompts = buildPrompts({ ...body, rawInfo });
    const choice = body?.provider || 'auto';

    const map = {
      gemini: { fn: runGemini, envHint: 'GEMINI_API_KEY (Google Gemini)' },
      openai: { fn: runOpenAI, envHint: 'OPENAI_API_KEY (ChatGPT / OpenAI)' },
      claude: { fn: runClaude, envHint: 'ANTHROPIC_API_KEY (Claude / Anthropic)' },
      groq: { fn: runGroq, envHint: 'GROQ_API_KEY (Groq)' },
      workers_ai: { fn: runWorkersAI, envHint: 'binding Workers AI tên AI' },
      free_auto: { fn: runPollinationsFree, envHint: 'AI Tự động' }
    };

    if (choice !== 'auto') {
      const target = map[choice];
      if (!target) {
        return json({ error: 'Công cụ AI không hợp lệ.' }, 400);
      }
      const res = await target.fn(env, prompts);
      if (!res) {
        return json(
          { error: `Máy chủ chưa cấu hình ${target.envHint}. Hãy kết nối công cụ AI trực tiếp trên trang hoặc chọn AI Tự động.` },
          503
        );
      }
      return res.ok ? json(res.data) : json({ error: res.error }, res.status);
    }

    for (const k of ['gemini', 'openai', 'claude', 'groq', 'workers_ai', 'free_auto']) {
      const res = await map[k].fn(env, prompts);
      if (res) {
        return res.ok ? json(res.data) : json({ error: res.error }, res.status);
      }
    }

    return json({ error: 'Không thể kết nối AI tự động lúc này.' }, 503);
  } catch (err) {
    return json({ error: err?.message || 'Không thể xử lý yêu cầu AI.' }, 500);
  }
}
