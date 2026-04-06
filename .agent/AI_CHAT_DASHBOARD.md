# AI_INTEGRATION.md

> **Mục đích:** File này là tài liệu kỹ thuật đầy đủ để AI Assistant tích hợp tính năng "AI Chat Assistant" vào Dashboard của hệ thống quản lý cao su (Ecotech 2A). Đọc toàn bộ file này trước khi thực hiện bất kỳ thay đổi nào.

---

## 1. Tổng quan tính năng

### 1.1 Vấn đề cần giải quyết

Hiện tại, người dùng (sếp, quản lý) phải **tự đọc → tự hiểu → tự phân tích** các biểu đồ trên Dashboard:

- Mở biểu đồ doanh thu → nhìn thấy giảm
- Mở sản lượng → check thủ công
- Mở bảng khách hàng → so sánh
- Mở tồn kho → kiểm tra

**Kết quả:** Mất 5–15 phút, phụ thuộc kỹ năng phân tích, dễ hiểu sai.

### 1.2 Giải pháp: AI Chat Assistant trong Dashboard

Thêm một cửa sổ chat vào Dashboard. Người dùng đặt câu hỏi bằng tiếng Việt tự nhiên, AI sẽ:

1. Hiểu câu hỏi (NLP)
2. Tự động truy vấn đúng dữ liệu cần thiết từ DB
3. Phân tích và tổng hợp
4. Trả lời bằng text rõ ràng + gợi ý / render biểu đồ nếu phù hợp

**Ví dụ:**

> **User hỏi:** "Tại sao doanh thu tháng này giảm?"
>
> **AI trả lời:** "Doanh thu tháng này giảm 18% so với tháng trước. Nguyên nhân chính là sản lượng giảm 10% và khách hàng Công ty A giảm lượng mua 40%. Giá bán không thay đổi nên không phải yếu tố ảnh hưởng."

### 1.3 Các câu hỏi mẫu cần hỗ trợ

| Loại câu hỏi | Ví dụ |
|---|---|
| So sánh | "Sản lượng tháng này tăng hay giảm so với tháng trước?" |
| Xếp hạng | "Top 5 khách hàng mua nhiều nhất là ai?" |
| Nguyên nhân | "Tại sao doanh thu tháng 6 thấp?" |
| Dự báo | "Quý sau sản lượng dự kiến thế nào?" |
| Tổng hợp | "Tóm tắt tình hình kinh doanh tháng này" |
| Tồn kho | "Mặt hàng nào đang tồn kho nhiều nhất?" |

---

## 2. Kiến trúc hệ thống

### 2.1 Luồng xử lý tổng thể (Function Calling Pattern)

```
User nhập câu hỏi
       │
       ▼
[Frontend] POST /api/ai/chat
  { message, conversationHistory }
       │
       ▼
[Backend] aiController.js
       │
       ├─► analyticsService.js ──► MongoDB (query dữ liệu thô)
       │         │
       │         └─► Trả về data tóm tắt (không gửi raw DB lên AI)
       │
       ├─► Đóng gói prompt = { context_data + câu hỏi + hướng dẫn format }
       │
       ▼
[OpenRouter API] → model :free
       │
       ▼
AI trả về JSON:
  {
    "text": "Câu trả lời bằng tiếng Việt",
    "chartData": { ... } | null,
    "chartType": "bar"|"line"|"pie" | null
  }
       │
       ▼
[Frontend] Render text + Chart component (nếu có chartData)
```

### 2.2 Nguyên tắc quan trọng

> **AI không được nhận toàn bộ database.** Backend phải tổng hợp số liệu trước, chỉ gửi bản tóm tắt (~500–1000 tokens) lên AI. Điều này giúp: tiết kiệm token, bảo mật data, tăng tốc độ phản hồi.

---

## 3. Cấu trúc thư mục cần tạo / chỉnh sửa

```
backend/
├── controllers/
│   └── aiController.js          ← TẠO MỚI
├── services/
│   ├── aiService.js             ← TẠO MỚI (gọi OpenRouter)
│   └── analyticsService.js      ← TẠO MỚI (query MongoDB)
├── routes/
│   └── aiRoute.js               ← TẠO MỚI
└── server.js                    ← CHỈNH SỬA (đăng ký route mới)

frontend/  (hoặc admin/)
└── src/
    ├── components/
    │   ├── AIChatWidget/
    │   │   ├── AIChatWidget.jsx  ← TẠO MỚI
    │   │   └── AIChatWidget.css  ← TẠO MỚI
    │   └── AIChartRenderer/
    │       └── AIChartRenderer.jsx ← TẠO MỚI
    └── pages/
        └── Dashboard.jsx         ← CHỈNH SỬA (nhúng AIChatWidget)
```

---

## 4. Backend — Chi tiết triển khai

### 4.1 `backend/services/analyticsService.js`

**Mục đích:** Query MongoDB, tổng hợp số liệu thành object gọn gàng. Đây là "nguồn dữ liệu" cho AI.

**Các hàm cần implement:**

```javascript
// Trả về tổng quan tháng hiện tại vs tháng trước
async function getMonthlyRevenueSummary()
// Output mẫu:
// {
//   currentMonth: { revenue: 450000000, orders: 120, month: "2025-06" },
//   previousMonth: { revenue: 548000000, orders: 145, month: "2025-05" },
//   revenueChange: -18.0,   // phần trăm thay đổi
//   ordersChange: -17.2
// }

// Trả về top N khách hàng theo doanh thu
async function getTopCustomers(limit = 5, month = null)
// Output mẫu:
// [
//   { name: "Công ty A", revenue: 120000000, orders: 30, change: -40.0 },
//   { name: "Công ty B", revenue: 95000000, orders: 22, change: +5.2 }
// ]

// Trả về tóm tắt sản lượng cao su
async function getProductionSummary(period = "month")
// Output mẫu:
// {
//   totalProduction: 85000,  // kg hoặc tấn
//   unit: "tấn",
//   change: -10.0,
//   byProduct: [
//     { name: "SVR 3L", quantity: 45000, change: -5 },
//     { name: "SVR 10", quantity: 40000, change: -15 }
//   ]
// }

// Trả về tình trạng tồn kho
async function getInventorySummary()
// Output mẫu:
// {
//   totalItems: 12,
//   highStock: ["SVR 3L", "RSS"],   // tồn nhiều
//   lowStock: ["SVR 20"],           // sắp hết
//   totalValue: 230000000
// }

// Hàm tổng hợp — gọi tất cả hàm trên, trả về 1 object để đưa vào prompt
async function buildDashboardContext()
// Output: object chứa tất cả summary ở trên
```

**Lưu ý khi implement:**
- Dùng Mongoose aggregation pipeline (`$group`, `$sort`, `$limit`) thay vì load tất cả documents rồi xử lý trong JS
- Cache kết quả 5 phút bằng `node-cache` hoặc biến module-level để tránh query DB mỗi tin nhắn
- Xử lý trường hợp collection rỗng (trả về giá trị mặc định, không throw error)
- Tên field trong MongoDB của dự án này cần được điều chỉnh theo schema thực tế — kiểm tra `backend/models/` để lấy tên field đúng

### 4.2 `backend/services/aiService.js`

**Mục đích:** Quản lý kết nối OpenRouter, fallback giữa các model free, đóng gói prompt, parse response.

**Cấu hình OpenRouter:**

```javascript
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;  // lấy từ .env

// Danh sách model ưu tiên (free tier) — thử theo thứ tự này
// Nếu model đầu bị lỗi 429 hoặc 503, tự động chuyển sang model tiếp theo
const FREE_MODEL_PRIORITY = [
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3-4b-it:free",
  "qwen/qwen-2-7b-instruct:free",
  "google/gemma-3-12b-it:free",
  "microsoft/phi-3-mini-128k-instruct:free"
];
```

**Logic fallback model:**

```javascript
async function callWithFallback(messages, systemPrompt) {
  // 1. Lấy danh sách model free đang online từ OpenRouter /models
  // 2. Lọc chỉ lấy model có ":free" trong ID
  // 3. Sắp xếp theo FREE_MODEL_PRIORITY (model ưu tiên lên trước)
  // 4. Vòng lặp: thử từng model
  //    - Nếu thành công → return response
  //    - Nếu lỗi 429 (quá tải) → sleep 1 giây → thử model tiếp
  //    - Nếu lỗi 403 (bị chặn) → thử model tiếp ngay
  //    - Nếu tất cả thất bại → throw Error("Tất cả model hiện tại không khả dụng")
}
```

**Cấu trúc System Prompt:**

```javascript
const SYSTEM_PROMPT = `
Bạn là AI Analyst của hệ thống quản lý cao su Ecotech 2A.
Nhiệm vụ: Phân tích dữ liệu kinh doanh và trả lời câu hỏi của quản lý bằng tiếng Việt.

QUY TẮC BẮT BUỘC:
1. Luôn trả lời bằng tiếng Việt, ngắn gọn, rõ ràng.
2. Dựa HOÀN TOÀN vào dữ liệu được cung cấp trong context. Không bịa đặt số liệu.
3. Nếu dữ liệu không đủ để trả lời, hãy nói rõ: "Dữ liệu hiện tại chưa đủ để phân tích..."
4. LUÔN trả về JSON hợp lệ theo đúng format sau, không thêm text ngoài JSON:

{
  "text": "Câu trả lời đầy đủ bằng tiếng Việt",
  "chartData": null hoặc object dữ liệu biểu đồ (xem format bên dưới),
  "chartType": null hoặc "bar" hoặc "line" hoặc "pie",
  "chartTitle": null hoặc "Tiêu đề biểu đồ"
}

FORMAT chartData khi cần vẽ biểu đồ bar/line:
{
  "labels": ["Tháng 1", "Tháng 2", ...],
  "datasets": [
    {
      "label": "Doanh thu (VNĐ)",
      "data": [100000000, 120000000, ...]
    }
  ]
}

FORMAT chartData khi cần vẽ biểu đồ pie:
{
  "labels": ["Công ty A", "Công ty B", ...],
  "datasets": [{ "data": [45, 30, 25] }]
}

Chỉ đề xuất biểu đồ khi câu hỏi liên quan đến: so sánh, xu hướng, phân bổ, xếp hạng.
`;
```

**Đóng gói User Message:**

```javascript
function buildUserMessage(question, dashboardContext) {
  return `
=== DỮ LIỆU DASHBOARD HIỆN TẠI ===
${JSON.stringify(dashboardContext, null, 2)}

=== CÂU HỎI CỦA QUẢN LÝ ===
${question}
`;
}
```

**Hàm chính export:**

```javascript
// messages = lịch sử hội thoại [{ role, content }, ...]
// dashboardContext = object từ analyticsService.buildDashboardContext()
async function askAI(userQuestion, conversationHistory, dashboardContext) {
  // 1. Build messages array (system + history + user message mới)
  // 2. Gọi callWithFallback()
  // 3. Parse JSON response từ AI
  // 4. Validate format (có field "text" không?)
  // 5. Return { text, chartData, chartType, chartTitle, modelUsed }
}
```

### 4.3 `backend/controllers/aiController.js`

```javascript
// POST /api/ai/chat
async function chat(req, res) {
  // 1. Validate input: req.body.message phải có, không rỗng
  // 2. Lấy conversationHistory từ req.body.history (array, default [])
  // 3. Giới hạn history tối đa 10 tin nhắn gần nhất (tránh vượt context window)
  // 4. Gọi analyticsService.buildDashboardContext()
  // 5. Gọi aiService.askAI(message, history, context)
  // 6. Trả về response chuẩn:
  //    { success: true, data: { text, chartData, chartType, chartTitle, modelUsed } }
  // 7. Bắt lỗi: trả về { success: false, message: "...", errors: null }
}
```

### 4.4 `backend/routes/aiRoute.js`

```javascript
import express from "express";
import { chat } from "../controllers/aiController.js";
import authMiddleware from "../middleware/auth.js";  // bảo vệ route — chỉ admin

const router = express.Router();

// Chỉ admin mới được dùng AI chat
router.post("/chat", authMiddleware, requireRole("Admin"), chat);

export default router;
```

### 4.5 Chỉnh sửa `backend/server.js`

Thêm dòng đăng ký route mới (theo pattern của các route hiện có trong project):

```javascript
import aiRoute from "./routes/aiRoute.js";
// ...
app.use("/api/ai", aiRoute);
```

### 4.6 Biến môi trường cần thêm vào `.env`

```env
# OpenRouter API Key — lấy tại https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxx

# HTTP Referer cho OpenRouter (bắt buộc với free tier)
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Ecotech2A Dashboard
```

---

## 5. Frontend — Chi tiết triển khai

### 5.1 `AIChatWidget.jsx` — Component chính

**Trạng thái (state) cần quản lý:**

```javascript
const [messages, setMessages] = useState([]);
// messages = [
//   { role: "assistant", text: "Xin chào...", chartData: null, chartType: null },
//   { role: "user", text: "Sản lượng tháng này thế nào?" },
//   { role: "assistant", text: "Sản lượng tháng 6...", chartData: {...}, chartType: "bar" }
// ]

const [inputValue, setInputValue] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [isOpen, setIsOpen] = useState(false);  // toggle mở/đóng widget
```

**Cấu trúc UI:**

```
┌─────────────────────────────────────┐
│ 🤖 AI Assistant          [_] [X]   │  ← Header, có nút thu nhỏ / đóng
├─────────────────────────────────────┤
│                                     │
│  [Tin nhắn AI - text + chart]      │
│  [Tin nhắn User]                   │
│  [Tin nhắn AI - text only]         │
│  [⏳ Đang phân tích...]            │  ← Loading indicator
│                                     │
├─────────────────────────────────────┤
│ 💡 Câu hỏi gợi ý:                 │
│ [Doanh thu tháng này?] [Top KH?]  │  ← Suggestion chips
│ [Tại sao giảm?] [Tồn kho?]       │
├─────────────────────────────────────┤
│ [Nhập câu hỏi...      ] [Gửi ▶]  │  ← Input + Send button
└─────────────────────────────────────┘
```

**Danh sách câu hỏi gợi ý (hardcode, có thể mở rộng):**

```javascript
const SUGGESTED_QUESTIONS = [
  "Tóm tắt tình hình kinh doanh tháng này",
  "Sản lượng tháng này tăng hay giảm?",
  "Top 5 khách hàng mua nhiều nhất",
  "Tại sao doanh thu thay đổi?",
  "Mặt hàng nào đang tồn kho nhiều nhất?",
  "So sánh doanh thu tháng này và tháng trước",
];
```

**Hàm gửi tin nhắn:**

```javascript
async function sendMessage(text) {
  // 1. Thêm tin nhắn user vào messages
  // 2. setIsLoading(true)
  // 3. Gọi POST /api/ai/chat với { message: text, history: messages (10 tin gần nhất) }
  // 4. Nhận response, thêm tin nhắn AI vào messages (có thể có chartData)
  // 5. setIsLoading(false)
  // 6. Scroll xuống cuối danh sách tin nhắn
  // 7. Xử lý lỗi: hiển thị thông báo lỗi thân thiện
}
```

**Lưu ý UX quan trọng:**
- Khi đang loading, disable input và nút gửi
- Auto-scroll xuống cuối mỗi khi có tin nhắn mới (dùng `useRef` + `scrollIntoView`)
- Sau khi click câu hỏi gợi ý → ẩn suggestion chips cho đến khi conversation reset
- Tin nhắn đầu tiên của AI (welcome message) hiển thị ngay khi mở widget, không cần gọi API

### 5.2 `AIChartRenderer.jsx` — Component render biểu đồ từ AI

**Mục đích:** Nhận `chartData`, `chartType`, `chartTitle` từ response AI và render thành biểu đồ tương ứng.

```javascript
// Props:
// - chartType: "bar" | "line" | "pie"
// - chartData: { labels, datasets }
// - chartTitle: string

function AIChartRenderer({ chartType, chartData, chartTitle }) {
  // Dùng thư viện chart hiện có trong project (Recharts hoặc Chart.js)
  // Kiểm tra project đang dùng gì trong package.json trước khi implement

  if (!chartData || !chartType) return null;

  // Render Chart component tương ứng với chartType
  // Wrap trong div có max-height: 300px để không chiếm quá nhiều không gian trong chat
}
```

**Kiểm tra thư viện chart trước khi implement:**

```bash
# Chạy lệnh này để xem project đang dùng thư viện chart nào
cat frontend/package.json | grep -E "recharts|chart.js|apexcharts|victory"
# hoặc
cat admin/package.json | grep -E "recharts|chart.js|apexcharts|victory"
```

Nếu chưa có thư viện nào, cài Recharts:

```bash
cd frontend  # hoặc admin
npm install recharts
```

### 5.3 Tích hợp vào `Dashboard.jsx`

Thêm vào cuối file Dashboard, trước closing tag của component:

```jsx
import AIChatWidget from "../components/AIChatWidget/AIChatWidget";

// Trong JSX của Dashboard:
<>
  {/* ... nội dung Dashboard hiện có ... */}
  
  {/* AI Chat Widget — floating button góc dưới phải */}
  <AIChatWidget />
</>
```

Widget sẽ hiển thị dạng **floating button** ở góc dưới phải màn hình. Khi click sẽ mở cửa sổ chat. Cách này không ảnh hưởng layout Dashboard hiện tại.

### 5.4 CSS cho Widget (floating style)

```css
/* AIChatWidget.css */

.ai-chat-toggle-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4f46e5;  /* màu chủ đạo — điều chỉnh theo design system */
  color: white;
  border: none;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-chat-window {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 1000;
  width: 400px;
  height: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

/* Responsive: mobile */
@media (max-width: 480px) {
  .ai-chat-window {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-message {
  background: #f3f4f6;
  border-radius: 12px 12px 12px 4px;
  padding: 12px;
  max-width: 85%;
  align-self: flex-start;
}

.user-message {
  background: #4f46e5;
  color: white;
  border-radius: 12px 12px 4px 12px;
  padding: 12px;
  max-width: 85%;
  align-self: flex-end;
}

.ai-loading {
  display: flex;
  gap: 4px;
  padding: 12px;
  align-self: flex-start;
}

.ai-loading span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: bounce 1.2s infinite;
}
.ai-loading span:nth-child(2) { animation-delay: 0.2s; }
.ai-loading span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}
```

---

## 6. API Contract

### `POST /api/ai/chat`

**Request:**
```json
{
  "message": "Tại sao doanh thu tháng này giảm?",
  "history": [
    { "role": "user", "content": "Tin nhắn cũ..." },
    { "role": "assistant", "content": "Trả lời cũ..." }
  ]
}
```

**Response thành công (200):**
```json
{
  "success": true,
  "data": {
    "text": "Doanh thu tháng này giảm 18% so với tháng trước. Nguyên nhân chính là...",
    "chartData": {
      "labels": ["Tháng 5", "Tháng 6"],
      "datasets": [
        {
          "label": "Doanh thu (VNĐ)",
          "data": [548000000, 450000000]
        }
      ]
    },
    "chartType": "bar",
    "chartTitle": "So sánh doanh thu tháng 5 và tháng 6",
    "modelUsed": "qwen/qwen3-coder:free"
  }
}
```

**Response khi không cần biểu đồ:**
```json
{
  "success": true,
  "data": {
    "text": "Top 5 khách hàng tháng này: 1. Công ty A (450tr), 2. Công ty B...",
    "chartData": null,
    "chartType": null,
    "chartTitle": null,
    "modelUsed": "meta-llama/llama-3.2-3b-instruct:free"
  }
}
```

**Response lỗi (500):**
```json
{
  "success": false,
  "data": null,
  "message": "Tất cả model AI hiện tại đang quá tải. Vui lòng thử lại sau.",
  "errors": null
}
```

---

## 7. Xử lý lỗi và Edge Cases

### 7.1 Backend

| Tình huống | Xử lý |
|---|---|
| Tất cả model free bị 429 | Trả về lỗi thân thiện, log model nào bị lỗi |
| MongoDB query lỗi | Vẫn gọi AI với context rỗng, AI sẽ nói "không đủ dữ liệu" |
| AI trả về JSON không hợp lệ | Parse an toàn, fallback về `{ text: rawResponse, chartData: null }` |
| API Key hết hạn / sai | Log lỗi rõ ràng, trả về 500 với message hướng dẫn |
| Câu hỏi rỗng | Validate ở controller, trả về 400 |

### 7.2 Frontend

| Tình huống | Xử lý |
|---|---|
| Request timeout (>15s) | Hiển thị "AI đang bận, thử lại sau" |
| Network offline | Hiển thị "Không có kết nối mạng" |
| chartData có cấu trúc lỗi | Try-catch, ẩn chart, chỉ hiển thị text |
| Lịch sử chat quá dài | Chỉ gửi 10 tin nhắn gần nhất lên server |

---

## 8. Bảo mật

- Route `/api/ai/chat` **phải** có middleware xác thực JWT (dùng `authMiddleware` có sẵn)
- Thêm rate limiting riêng cho route này: **tối đa 20 request/phút/user** để tránh lạm dụng
- `OPENROUTER_API_KEY` chỉ tồn tại trong `.env` phía server, **không bao giờ** expose ra frontend
- Sanitize `req.body.message` trước khi đưa vào prompt (loại bỏ ký tự đặc biệt có thể gây prompt injection)
- Log câu hỏi của user (không log API key hay thông tin nhạy cảm)

---

## 9. Cài đặt Dependencies

```bash
# Backend — nếu chưa có
cd backend
npm install node-fetch  # nếu dùng CommonJS và cần fetch
# node-cache (tùy chọn, để cache analytics data)
npm install node-cache

# Frontend/Admin — nếu chưa có chart library
cd frontend  # hoặc cd admin
npm install recharts
```

---

## 10. Thứ tự implement (khuyến nghị)

Thực hiện **theo đúng thứ tự này** để có thể test từng bước:

### Bước 1 — Kiểm tra schema MongoDB

```bash
# Xem tên field thực tế trong các model
cat backend/models/*.js
# Ghi chú lại: tên collection, tên field doanh thu, ngày tháng, khách hàng, sản lượng
```

Sau đó điều chỉnh các query trong `analyticsService.js` cho đúng với tên field thực tế.

### Bước 2 — Implement `analyticsService.js`

Test bằng cách gọi trực tiếp từ một script test:
```bash
node -e "import('./services/analyticsService.js').then(s => s.buildDashboardContext().then(console.log))"
```

### Bước 3 — Implement `aiService.js`

Test kết nối OpenRouter và fallback model trước khi tích hợp vào controller.

### Bước 4 — Implement `aiController.js` + `aiRoute.js` + đăng ký vào `server.js`

Test bằng Postman hoặc curl:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Tóm tắt tình hình tháng này", "history": []}'
```

### Bước 5 — Implement `AIChatWidget.jsx` + `AIChartRenderer.jsx`

Test với hardcode response trước (mock API), sau đó kết nối thật.

### Bước 6 — Tích hợp vào `Dashboard.jsx`

### Bước 7 — Test end-to-end với các câu hỏi mẫu

---

## 11. Checklist hoàn thành

- [ ] `analyticsService.js` query đúng data từ MongoDB schema thực tế
- [ ] `aiService.js` fallback model hoạt động (test với model bị tắt giả lập)
- [ ] `POST /api/ai/chat` trả về đúng format JSON
- [ ] Route được bảo vệ bởi auth middleware
- [ ] `AIChatWidget.jsx` hiển thị đúng — floating button, cửa sổ chat, suggestion chips
- [ ] Loading indicator hiển thị khi đang chờ AI
- [ ] `AIChartRenderer.jsx` render đúng bar/line/pie chart
- [ ] Responsive trên mobile
- [ ] Xử lý lỗi hiển thị thông báo thân thiện (không hiện raw error)
- [ ] `OPENROUTER_API_KEY` không bị commit lên git (kiểm tra `.gitignore`)
- [ ] Rate limiting áp dụng cho route `/api/ai/chat`

---

## 12. Tham chiếu

- OpenRouter API Docs: https://openrouter.ai/docs
- OpenRouter Free Models: https://openrouter.ai/models?q=free
- Recharts: https://recharts.org/en-US/
- Rule files dự án: `AGENTS.md`, `BACKEND_RULES.md`, `FRONTEND_RULES.md`, `API_RULES.md`, `DATABASE_RULES.md`
- Middleware auth có sẵn: `backend/middleware/auth.js`
- Route pattern tham khảo: `backend/routes/orderRoute.js`