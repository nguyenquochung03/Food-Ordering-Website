const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || null;

const FREE_MODEL_PRIORITY = [
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3-4b-it:free",
  "qwen/qwen-2-7b-instruct:free",
  "google/gemma-3-12b-it:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

async function fetchAvailableModels() {
  if (!OPENROUTER_API_KEY) return [];
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map((m) => m.id || m.model || m.name || m).filter(Boolean);
  } catch (error) {
    console.warn("aiUserService.fetchAvailableModels error", error);
    return [];
  }
}

async function callWithFallback(messages, opts = {}) {
  if (!OPENROUTER_API_KEY) {
    const e = new Error("OPENROUTER_API_KEY_NOT_CONFIGURED");
    e.name = "AI_UNAVAILABLE";
    throw e;
  }

  const available = await fetchAvailableModels();

  const availSet = Array.from(new Set(available || []));
  const preferred = [];
  for (const pref of FREE_MODEL_PRIORITY) {
    const base = String(pref).split(":")[0];
    const match = availSet.find((m) => m === pref || m.startsWith(base));
    if (match) preferred.push(match);
  }

  const others = availSet.filter((m) => !preferred.includes(m) && (m.includes(":free") || /\bfree\b/.test(m) || m === "openrouter/auto"));
  const candidates = [...preferred, ...others];

  if (candidates.length === 0) {
    const fallback = FREE_MODEL_PRIORITY.map((p) => String(p).split(":")[0]);
    candidates.push(...fallback);
  }

  let lastErr = null;
  const referer = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
  const title = process.env.OPENROUTER_SITE_NAME || "Food Delivery App";
  const timeoutMs = opts.timeout || 15000;

  for (const model of candidates) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": title,
        },
        body: JSON.stringify({ model, messages }),
      });

      clearTimeout(id);

      if (res.status === 429) {
        lastErr = new Error(`Model ${model} busy (429)`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      if (res.status === 403 || res.status === 401) {
        lastErr = new Error(`Model ${model} forbidden/unauthorized (${res.status})`);
        continue;
      }
      if (!res.ok) {
        lastErr = new Error(`Model ${model} responded ${res.status}`);
        continue;
      }

      const data = await res.json();
      return { data, modelUsed: model };
    } catch (error) {
      lastErr = error.name === "AbortError" ? new Error(`Model ${model} timeout`) : error;
      continue;
    }
  }

  const finalErr = lastErr || new Error("No models available");
  const wrapped = new Error(finalErr.message || String(finalErr));
  wrapped.name = "AI_UNAVAILABLE";
  throw wrapped;
}

const USER_SYSTEM_PROMPT = `Bạn là trợ lý AI thân thiện của nhà hàng ăn uống Food Delivery.
Nhiệm vụ: Trả lời khách hàng về nhà hàng, thực đơn, khuyến mãi, dịch vụ.

✅ PHẢI LÀM:
- Trả lời bằng tiếng Việt tự nhiên, thân thiện, vui vẻ
- Chào hỏi lịch sự khi khách bắt đầu trò chuyện
- Gợi ý món ăn theo sở thích, ngân sách
- Giải thích nguyên liệu, cách chế biến
- Hướng dẫn đặt hàng, thanh toán, giao hàng
- Dùng emoji 🥘🍜🍛 để làm sinh động
- Trả lời ngắn gọn, dễ hiểu
- Nếu không biết thì nói "Xin lỗi, tôi chưa rõ vấn đề này, bạn vui lòng liên hệ tổng đài 1900..."

❌ KHÔNG ĐƯỢC:
- Đưa ra thông tin sai lệch về nhà hàng
- Sử dụng ngôn ngữ không lịch sự
- Chia sẻ thông tin cá nhân hoặc dữ liệu nhạy cảm
- Đáp ứng yêu cầu ngoài lĩnh vực nhà hàng, đồ ăn

Luôn trả lời trực tiếp câu hỏi của khách hàng, không sử dụng markdown hay JSON.
`;

export async function askUserAI(userQuestion, conversationHistory = []) {
  if (!userQuestion || typeof userQuestion !== "string" || !userQuestion.trim()) {
    throw new Error("EMPTY_QUESTION");
  }

  if (!OPENROUTER_API_KEY) {
    return {
      text: "Xin lỗi, chức năng AI đang được nâng cấp. Bạn vui lòng thử lại sau nhé! 🙏",
      modelUsed: null,
    };
  }

  const messages = [
    { role: "system", content: USER_SYSTEM_PROMPT },
    ...conversationHistory.slice(-10),
    { role: "user", content: userQuestion },
  ];

  const result = await callWithFallback(messages);
  const aiResponse = result?.data?.choices?.[0]?.message?.content || result?.data?.choices?.[0]?.text || "Xin lỗi, tôi không hiểu rõ yêu cầu của bạn. Bạn vui lòng hỏi lại được không? 😊";

  return {
    text: aiResponse.trim(),
    modelUsed: result.modelUsed || null,
  };
}

export default { askUserAI };
