import { GoogleGenAI, Type } from "@google/genai";

let cachedClient = null;
function getClient() {
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
    "4. Trả về JSON đúng schema yêu cầu, văn bản tiếng Việt có dấu chuẩn Unicode.",
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

export async function polishDocumentWithAI(input) {
  const ai = getClient();
  if (!ai) {
    const err = new Error(
      "Chưa có GEMINI_API_KEY trên máy chủ. Hãy kiểm tra phần Settings > Secrets (hoặc biến môi trường trên Cloudflare Pages)."
    );
    err.statusCode = 503;
    throw err;
  }

  const { systemInstruction, contents } = buildPolishPromptPayload(input);

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

  const rawText = (response.text || "").trim();
  const parsed = JSON.parse(rawText);
  return {
    ty: String(parsed.ty || "").trim(),
    cc: Array.isArray(parsed.cc) ? parsed.cc.map((x) => String(x).trim()).filter(Boolean) : [],
    nd: String(parsed.nd || "").trim(),
    summary: String(parsed.summary || "").trim(),
    provider: "Gemini (gemini-4-hydrogen)",
  };
}
