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
    // OpenRouter may return { data: [...] } or an array directly
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map((m) => m.id || m.model || m.name || m).filter(Boolean);
  } catch (error) {
    console.warn("aiService.fetchAvailableModels error", error);
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

  // Build final queue: prioritized models present first, then remaining free models
  const preferred = FREE_MODEL_PRIORITY.filter((m) => available.includes(m));
  const others = available.filter((m) => m.includes(":free") && !preferred.includes(m));
  const candidates = [...preferred, ...others];

  // If no live free models found, fall back to the static priority list
  if (candidates.length === 0) candidates.push(...FREE_MODEL_PRIORITY);

  let lastErr = null;
  const referer = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
  const title = process.env.OPENROUTER_SITE_NAME || "Ecotech2A Dashboard";
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
        // wait a bit and try next model
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (res.status === 403 || res.status === 401) {
        lastErr = new Error(`Model ${model} forbidden/unauthorized (${res.status})`);
        // skip immediately
        continue;
      }

      if (!res.ok) {
        lastErr = new Error(`Model ${model} responded ${res.status}`);
        continue;
      }

      const data = await res.json();
      return { data, modelUsed: model };
    } catch (error) {
      // handle AbortError separately to give clearer message
      lastErr = error.name === "AbortError" ? new Error(`Model ${model} timeout`) : error;
      continue;
    }
  }

  // Normalize thrown error so controller can detect AI availability issues
  const finalErr = lastErr || new Error("No models available");
  const wrapped = new Error(finalErr.message || String(finalErr));
  wrapped.name = "AI_UNAVAILABLE";
  throw wrapped;
}

const SYSTEM_PROMPT = `Bạn là AI Analyst của hệ thống quản lý. Trả lời bằng tiếng Việt. Nếu dữ liệu không đủ, nói rõ. Luôn trả về JSON theo format {"text":...,"chartData":null,"chartType":null,"chartTitle":null}`;

function buildUserMessage(question, dashboardContext) {
  return `=== DỮ LIỆU DASHBOARD HIỆN TẠI ===\n${JSON.stringify(dashboardContext, null, 2)}\n\n=== CÂU HỎI CỦA QUẢN LÝ ===\n${question}`;
}

export async function askAI(userQuestion, conversationHistory = [], dashboardContext = {}) {
  if (!userQuestion || typeof userQuestion !== "string" || !userQuestion.trim()) {
    throw new Error("EMPTY_QUESTION");
  }

  if (!OPENROUTER_API_KEY) {
    // Safe fallback so endpoint still works in dev without key
    return {
      text: "OPENROUTER_API_KEY chưa được cấu hình trên server. Vui lòng liên hệ admin.",
      chartData: null,
      chartType: null,
      chartTitle: null,
      modelUsed: null,
    };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-10),
    { role: "user", content: buildUserMessage(userQuestion, dashboardContext) },
  ];

  const { data, modelUsed } = await callWithFallback(messages);

  try {
    const raw = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);
    // Try parse JSON response from assistant
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Not JSON — return as text
      return { text: String(raw), chartData: null, chartType: null, chartTitle: null, modelUsed };
    }

    return {
      text: parsed.text || "",
      chartData: parsed.chartData || null,
      chartType: parsed.chartType || null,
      chartTitle: parsed.chartTitle || null,
      modelUsed,
    };
  } catch (error) {
    console.error("aiService.askAI parse error", error);
    return { text: "Lỗi khi xử lý phản hồi từ AI", chartData: null, chartType: null, chartTitle: null, modelUsed: null };
  }
}

export default { askAI };
