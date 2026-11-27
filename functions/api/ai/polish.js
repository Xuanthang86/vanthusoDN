/* Cloudflare Pages Function cho /api/ai/polish
 * Hỗ trợ các AI miễn phí trên máy chủ:
 * 1) Google Gemini Free Tier (GEMINI_API_KEY - gemini-4-hydrogen)
 * 2) Groq Free Tier (GROQ_API_KEY - llama-3.3-70b-versatile)
 * 3) Cloudflare Workers AI (binding AI - miễn phí 10.000 neurons/ngày)
 */
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

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
    'Trả về duy nhất JSON gồm 4 khóa: ty (string), cc (string[]), nd (string), summary (string).'
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

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const rawInfo = typeof body?.rawInfo === 'string' ? body.rawInfo.slice(0, 15000) : '';
    const currentDraft = body?.currentDraft || {};
    if (!rawInfo.trim() && !String(currentDraft.nd || '').trim() && !String(currentDraft.ty || '').trim()) {
      return json({ error: 'Vui lòng nhập thông tin gốc hoặc nội dung nháp để AI biên tập.' }, 400);
    }

    const { systemInstruction, contents } = buildPrompts({ ...body, rawInfo });

    /* 1. Google Gemini Free Tier */
    if (env && env.GEMINI_API_KEY) {
      const resp = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent',
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
      if (!resp.ok) {
        return json({ error: data?.error?.message || `Lỗi Gemini API (${resp.status}).` }, resp.status);
      }
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return json(normalizeOut(extractJson(txt), 'Google Gemini (miễn phí)'));
    }

    /* 2. Groq Free Tier (nếu cấu hình GROQ_API_KEY) */
    if (env && env.GROQ_API_KEY) {
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
        return json({ error: data?.error?.message || `Lỗi Groq API (${resp.status}).` }, resp.status);
      }
      const txt = data?.choices?.[0]?.message?.content || '';
      return json(normalizeOut(extractJson(txt), 'Groq Llama 3.3 (miễn phí)'));
    }

    /* 3. Cloudflare Workers AI (nếu gắn binding AI trong Cloudflare Pages) */
    if (env && env.AI) {
      const out = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: contents }
        ]
      });
      const txt = out?.response || '';
      return json(normalizeOut(extractJson(txt), 'Cloudflare Workers AI (miễn phí)'));
    }

    return json(
      {
        error:
          'Máy chủ Cloudflare Pages chưa cấu hình biến môi trường AI miễn phí (GEMINI_API_KEY, GROQ_API_KEY hoặc binding Workers AI).'
      },
      503
    );
  } catch (err) {
    return json({ error: err?.message || 'Không thể xử lý yêu cầu AI.' }, 500);
  }
}
