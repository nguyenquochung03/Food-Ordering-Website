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

  // Build final queue: try to match preferred list flexibly (strip any ":free" suffix)
  const availSet = Array.from(new Set(available || []));

  const preferred = [];
  for (const pref of FREE_MODEL_PRIORITY) {
    const base = String(pref).split(":")[0];
    // exact match or startsWith base name
    const match = availSet.find((m) => m === pref || m.startsWith(base));
    if (match) preferred.push(match);
  }

  // Collect other candidate free models (include explicit ':free' tags or 'free' in id)
  const others = availSet.filter((m) => !preferred.includes(m) && (m.includes(":free") || /\bfree\b/.test(m) || m === "openrouter/auto"));

  const candidates = [...preferred, ...others];

  // If no live candidates found, fallback to base names of our priority list
  if (candidates.length === 0) {
    const fallback = FREE_MODEL_PRIORITY.map((p) => String(p).split(":")[0]);
    candidates.push(...fallback);
  }

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

import toolRegistry from "./toolRegistry.js";

const SYSTEM_PROMPT_TOOL_SELECTION = `Bạn là AI phân tích dữ liệu nhà hàng.\nNhiệm vụ: Chọn tool cần thiết để trả lời câu hỏi của admin.\n\nQUY TẮC:\n- Chọn TỐI THIỂU tool cần thiết, không gọi thừa\n- Câu hỏi so sánh → thêm parameter "compareWith"\n- Câu hỏi xu hướng/biểu đồ → bắt buộc chọn "get_time_series_data"\n- Câu hỏi tổng quan → "get_revenue_summary" + "get_order_status_breakdown"\n- Câu hỏi nguyên nhân → chọn nhiều tool để đủ góc nhìn\n\nTrả về JSON hợp lệ:\n{\n  "toolCalls": [{ "name": "tên_tool", "parameters": { "period": "month" } }],\n  "reasoning": "1 câu giải thích ngắn"\n}\n`;

const SYSTEM_PROMPT_ANSWER_WRITER = `Bạn là AI phân tích kinh doanh nhà hàng. Viết câu trả lời từ dữ liệu đã có.\n\nPHẢI LÀM:\n- Trả lời bằng tiếng Việt, dựa 100% vào dữ liệu cung cấp\n- Câu đầu tiên trả lời thẳng vào câu hỏi\n- Nêu số cụ thể: "tăng 18%", "123 đơn", "4.500.000đ"\n- Ngắn gọn: 3–5 câu, dùng \n- nếu có nhiều điểm\n- Trình bày có cấu trúc rõ ràng\n\nTRONG MỌI TRƯỜNG HỢP KHÔNG ĐƯỢC:\n- Bịa số liệu không có trong dữ liệu\n- Dùng "có thể", "có lẽ" khi đã có số thực\n- Lặp lại câu hỏi\n- Thêm disclaimer dài dòng\n\nLUÔN trả về JSON (không thêm text ngoài JSON):\n{\n  "text": "Câu trả lời. Dùng **text** để in đậm số quan trọng. Dùng \n- cho danh sách.",\n  "chartData": null | { "labels": [...], "datasets": [{ "label": "...", "data": [...] }] },\n  "chartType": null | "bar" | "line" | "pie" | "area",\n  "chartTitle": null | "Tiêu đề ngắn",\n  "insight": null | "1 nhận xét quan trọng nhất"\n}\n\nVẼ BIỂU ĐỒ KHI: so sánh nhiều kỳ → bar/line | xu hướng → area | cơ cấu % → pie\n`;

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

  // Step 1: Tool selection
  const toolDefs = toolRegistry.getAllToolDefinitions();
  const selectionPrompt = `DANH SÁCH TOOLS:\n${JSON.stringify(toolDefs, null, 2)}\n\nCÂU HỎI:\n${userQuestion}`;

  const step1Messages = [
    { role: "system", content: SYSTEM_PROMPT_TOOL_SELECTION },
    ...conversationHistory.slice(-10),
    { role: "user", content: selectionPrompt },
  ];

  const step1 = await callWithFallback(step1Messages);
  const step1Raw = step1?.data?.choices?.[0]?.message?.content || step1?.data?.choices?.[0]?.text || JSON.stringify(step1?.data);
  let step1Parsed = null;
  try {
    step1Parsed = JSON.parse(step1Raw);
  } catch (e) {
    // If AI didn't return JSON, fall back to single tool: revenue summary
    step1Parsed = { toolCalls: [{ name: "get_revenue_summary", parameters: { period: "month" } }], reasoning: "fallback" };
  }

  const toolCalls = Array.isArray(step1Parsed.toolCalls) ? step1Parsed.toolCalls : [];

  // Execute tools
  const toolResults = {};
  for (const call of toolCalls) {
    try {
      const name = call.name;
      const params = call.parameters || {};
      const out = await toolRegistry.executeTool(name, params);
      toolResults[name] = out;
    } catch (err) {
      toolResults[call.name] = { error: String(err) };
    }
  }

  // Step 2: Answer writer — provide tool results
  const resultPayload = {
    question: userQuestion,
    toolResults,
    dashboardContext,
  };

  const step2Messages = [
    { role: "system", content: SYSTEM_PROMPT_ANSWER_WRITER },
    { role: "user", content: JSON.stringify(resultPayload, null, 2) },
  ];

  const step2 = await callWithFallback(step2Messages);
  const step2Raw = step2?.data?.choices?.[0]?.message?.content || step2?.data?.choices?.[0]?.text || JSON.stringify(step2?.data);
  try {
    const parsed = JSON.parse(step2Raw);
    return {
      text: parsed.text || "",
      chartData: parsed.chartData || null,
      chartType: parsed.chartType || null,
      chartTitle: parsed.chartTitle || null,
      insight: parsed.insight || null,
      modelUsed: step2.modelUsed || step1.modelUsed || null,
      toolCalls: toolCalls,
      toolResults,
    };
  } catch (error) {
    // fallback: return raw text
    return { text: String(step2Raw), chartData: null, chartType: null, chartTitle: null, modelUsed: step2.modelUsed || step1.modelUsed || null, toolCalls, toolResults };
  }
}

export default { askAI };
