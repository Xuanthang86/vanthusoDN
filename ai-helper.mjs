import { GoogleGenAI, Type } from "@google/genai";

let cachedClient = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return cachedClient;
}

export function getAvailableAiProviders() {
  return {
    free_auto: true,
    gemini: Boolean(process.env.GEMINI_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    workers_ai: false,
  };
}

export function buildPolishPromptPayload({
  mode = "nn",
  docType = "KH",
  docTypeName = "Kế hoạch",
  orgName = "",
  editStyle = "polish",
  rawInfo = "",
  currentDraft = {},
}) {
  const isState = mode !== "dang";
  const styleDesc =
    editStyle === "draft"
      ? "Chuyển hóa các ghi chú thô / thông tin gốc thành văn bản hành chính hoàn chỉnh, chia mục hợp lý theo loại văn bản."
      : editStyle === "concise"
      ? "Rút gọn câu từ thật cô đọng, súc tích, bỏ hoàn toàn từ ngữ rườm rà và ý trùng lặp nhưng vẫn giữ đủ nội dung chính."
      : "Biên tập lại câu từ cho suôn mượt, mạch lạc, chuẩn văn phong hành chính, gộp và loại bỏ mọi câu/ý bị lặp lại.";

  const systemInstruction = [
    "Bạn là chuyên gia văn thư - lưu trữ hành chính Việt Nam, am hiểu sâu Nghị định 30/2020/NĐ-CP (Khối Chính quyền) và Hướng dẫn 05-HD/VPTW (Khối Đảng).",
    `Chế độ hiện tại: ${isState ? "Khối Chính quyền (NĐ 30/2020/NĐ-CP) - BẮT BUỘC viết 'Ủy'/'ủy' (ví dụ: Ủy ban, ủy quyền)." : "Khối Đảng (HD 05-HD/VPTW) - BẮT BUỘC viết 'Uỷ'/'uỷ' (ví dụ: Đảng uỷ, Uỷ ban), trích yếu viết thường chữ cái đầu."}`,
    `Loại văn bản đang soạn: ${docTypeName} (mã ${docType}).`,
    orgName ? `Cơ quan ban hành: ${orgName}.` : "",
    `Yêu cầu biên tập: ${styleDesc}`,
    "Nguyên tắc bắt buộc:",
    "1. Câu từ trang trọng, khách quan, chuẩn mực văn phong hành chính công vụ Việt Nam; diễn đạt suôn mượt, gọn gàng, không lặp từ, không lặp ý giữa các mục.",
    "2. Giữ nguyên tuyệt đối số liệu, ngày tháng, tên riêng, địa danh, căn cứ pháp lý người dùng đã cung cấp; KHÔNG tự bịa đặt số hiệu văn bản hoặc số liệu không có trong thông tin gốc (nếu thiếu có thể dùng dấu '…').",
    "3. Định dạng đúng thể thức theo loại văn bản:",
    "   - Không bao gồm phần Quốc hiệu, Tiêu ngữ, Số ký hiệu, Ngày tháng, Nơi nhận hoặc Chữ ký trong trường 'nd' (những phần này hệ thống tự ghép riêng).",
    "   - Nếu là Quyết định/Nghị quyết: phần 'nd' trình bày theo 'Điều 1.', 'Điều 2.'... và điều cuối nêu hiệu lực/trách nhiệm thi hành.",
    "   - Nếu là Kế hoạch/Báo cáo/Tờ trình/Hướng dẫn/Chương trình/Đề án: dùng đề mục chuẩn 'I., II., ...' hoặc '1., 2., 2.1., ...'.",
    "   - Nếu là Công văn: câu mở đầu rõ ràng, các nội dung đề nghị/triển khai đánh số 1., 2. gọn gàng, câu kết đề nghị phối hợp thực hiện.",
    "   - Đoạn cuối cùng của 'nd' kết thúc bằng './.' (trừ khi đã có).",
    "   - Phần 'cc' (mảng chuỗi): mỗi căn cứ kết thúc bằng dấu ';' (nếu khối Nhà nước và dòng cuối là 'Theo đề nghị của ...' thì kết thúc bằng '.'). Chỉ giữ căn cứ có trong đầu vào hoặc thật sự phù hợp nếu người dùng yêu cầu viết hoàn chỉnh; nếu không có căn cứ thì trả về mảng rỗng.",
    "   - Phần 'ty' (trích yếu): ngắn gọn, phản ánh đúng nội dung chính, không kết thúc bằng dấu chấm/phẩy. Nếu là Công văn thì không ghi chữ 'V/v' ở đầu.",
    "4. Trả về duy nhất JSON hợp lệ gồm 4 khóa: ty (string), cc (string[]), nd (string), summary (string), văn bản tiếng Việt có dấu chuẩn Unicode.",
  ]
    .filter(Boolean)
    .join("\n");

  const userParts = [];
  if (rawInfo && rawInfo.trim()) {
    userParts.push("=== THÔNG TIN GỐC / Ý CHÍNH NGƯỜI DÙNG CUNG CẤP ===\n" + rawInfo.trim());
  }
  if (currentDraft && (currentDraft.ty || currentDraft.cc || currentDraft.nd)) {
    userParts.push(
      "=== BẢN NHÁP HIỆN CÓ TRONG TRÌNH SOẠN THẢO ===\n" +
        (currentDraft.ty ? `Trích yếu hiện tại: ${currentDraft.ty}\n` : "") +
        (currentDraft.cc ? `Căn cứ hiện tại:\n${currentDraft.cc}\n` : "") +
        (currentDraft.nd ? `Nội dung hiện tại:\n${currentDraft.nd}` : "")
    );
  }
  if (!userParts.length) {
    userParts.push(`Hãy gợi ý nội dung mẫu hoàn chỉnh, ngắn gọn cho loại văn bản ${docTypeName}.`);
  }

  return {
    systemInstruction,
    contents: userParts.join("\n\n"),
  };
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ty: {
      type: Type.STRING,
      description: "Trích yếu nội dung ngắn gọn, chuẩn thể thức (không có dấu chấm cuối).",
    },
    cc: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Danh sách các dòng căn cứ ban hành (mỗi dòng một căn cứ, kết thúc dấu ; hoặc .).",
    },
    nd: {
      type: Type.STRING,
      description: "Nội dung chính văn bản đã được biên tập suôn mượt, gọn gàng, không lặp ý, kết thúc bằng ./.",
    },
    summary: {
      type: Type.STRING,
      description: "Tóm tắt ngắn gọn 1-2 câu về những điểm đã được biên tập, rút gọn hoặc chuẩn hóa.",
    },
  },
  required: ["ty", "cc", "nd", "summary"],
};

function extractJson(text) {
  const s = String(text || "").trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse((fenced ? fenced[1] : s).trim());
}

function normalizeOut(parsed, provider) {
  return {
    ty: String(parsed.ty || "").trim(),
    cc: Array.isArray(parsed.cc) ? parsed.cc.map((x) => String(x).trim()).filter(Boolean) : [],
    nd: String(parsed.nd || "").trim(),
    summary: String(parsed.summary || "").trim(),
    provider,
  };
}

async function withRetry(fn, maxRetries = 1) {
  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err && (err.status || err.code);
      if (i < maxRetries && (status === 429 || (status >= 500 && status < 600))) {
        await new Promise((r) => setTimeout(r, 700 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function callGemini({ systemInstruction, contents }) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const response = await withRetry(() =>
    ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    })
  );
  return normalizeOut(extractJson(response.text || ""), "Google Gemini (gemini-4-hydrogen)");
}

async function callOpenAI({ systemInstruction, contents }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: contents },
      ],
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(data?.error?.message || `Lỗi ChatGPT / OpenAI (${resp.status}).`);
    err.statusCode = resp.status;
    throw err;
  }
  return normalizeOut(extractJson(data?.choices?.[0]?.message?.content || ""), `ChatGPT (${model})`);
}

async function callClaude({ systemInstruction, contents }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemInstruction,
      messages: [{ role: "user", content: contents }],
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(data?.error?.message || `Lỗi Claude / Anthropic (${resp.status}).`);
    err.statusCode = resp.status;
    throw err;
  }
  const txt = (data?.content || []).map((b) => b?.text || "").join("");
  return normalizeOut(extractJson(txt), `Claude (${model})`);
}

async function callGroq({ systemInstruction, contents }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: contents },
      ],
    }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(data?.error?.message || `Lỗi Groq (${resp.status}).`);
    err.statusCode = resp.status;
    throw err;
  }
  return normalizeOut(extractJson(data?.choices?.[0]?.message?.content || ""), "Groq (Llama 3.3)");
}

async function callPollinationsFree({ systemInstruction, contents }) {
  const resp = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      private: true,
      jsonMode: true,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: contents },
      ],
    }),
  });
  const txt = await resp.text();
  if (!resp.ok) {
    let msg = `AI miễn phí đang tạm bận (${resp.status}).`;
    try {
      const parsed = JSON.parse(txt);
      if (parsed?.error?.code === "FREE_LIMIT") {
        msg = "AI tự động đang tạm giới hạn lượt liên tiếp theo IP (đợi khoảng 45 giây hoặc kết nối ChatGPT/Gemini/Claude ngay trên trang).";
      } else if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch (_) {}
    const err = new Error(msg);
    err.statusCode = resp.status === 402 ? 429 : resp.status;
    throw err;
  }
  return normalizeOut(extractJson(txt), "AI Tự động (Miễn phí)");
}

export async function polishDocumentWithAI(input) {
  const payload = buildPolishPromptPayload(input);
  const choice = input.provider || "auto";

  const runners = {
    gemini: { fn: callGemini, envName: "GEMINI_API_KEY", label: "Google Gemini" },
    openai: { fn: callOpenAI, envName: "OPENAI_API_KEY", label: "ChatGPT (OpenAI)" },
    claude: { fn: callClaude, envName: "ANTHROPIC_API_KEY", label: "Claude (Anthropic)" },
    groq: { fn: callGroq, envName: "GROQ_API_KEY", label: "Groq" },
    free_auto: { fn: callPollinationsFree, envName: "", label: "AI Tự động" },
  };

  if (choice !== "auto") {
    if (choice === "workers_ai") {
      const err = new Error("Cloudflare Workers AI chỉ hoạt động khi triển khai trên Cloudflare Pages với binding AI.");
      err.statusCode = 503;
      throw err;
    }
    const target = runners[choice];
    if (!target) {
      const err = new Error("Công cụ AI không hợp lệ.");
      err.statusCode = 400;
      throw err;
    }
    const out = await target.fn(payload);
    if (!out) {
      const err = new Error(`Máy chủ chưa cấu hình ${target.envName} cho ${target.label}. Hãy kết nối ${target.label} trực tiếp trên trang hoặc chọn AI Tự động.`);
      err.statusCode = 503;
      throw err;
    }
    return out;
  }

  for (const key of ["gemini", "openai", "claude", "groq", "free_auto"]) {
    const out = await runners[key].fn(payload);
    if (out) return out;
  }

  const err = new Error("Không thể kết nối AI tự động lúc này. Hãy thử kết nối công cụ AI trực tiếp trên trang.");
  err.statusCode = 503;
  throw err;
}
