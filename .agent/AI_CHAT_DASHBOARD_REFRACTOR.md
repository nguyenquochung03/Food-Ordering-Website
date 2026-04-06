# PROMPT — Nâng cấp AI Chat (v2)

> Dự án đã có AI Chat hoạt động cơ bản. Cần nâng cấp thêm 3 điểm sau.
> **Đọc codebase hiện tại trước, không giả định.**

---

## TRƯỚC KHI LÀM — ĐỌC 4 FILE NÀY

```
backend/services/aiService.js        → xem logic hiện tại, fallback model
backend/models/*.js                  → tên field thực tế trong DB
admin/src/components/AIChatWidget/   → code widget hiện tại
admin/src/index.css (hoặc App.css)   → CSS variables màu chủ đạo
```

---

## NÂNG CẤP 1 — MỞ RỘNG TOOL (AI gọi được nhiều API hơn)

**Vấn đề:** AI hiện chỉ gọi được vài API cố định.  
**Giải pháp:** Xây dựng Tool Registry + vòng lặp 2 bước (chọn tool → trả lời).

### Tạo `backend/services/toolRegistry.js`

Mỗi tool có 3 phần: `name`, `description` (để AI hiểu khi nào dùng), `execute(params)`.

Implement đủ các tool sau — **đọc schema thực tế để đặt tên field đúng**:

| name | description | output chính |
|---|---|---|
| `get_revenue_summary` | Doanh thu + số đơn, so sánh kỳ trước | `{ total, orderCount, change% }` |
| `get_top_foods` | Top món bán chạy | `[{ name, sold, revenue }]` |
| `get_order_status_breakdown` | Phân tích trạng thái đơn hàng | `{ pending, done, cancelled, cancelRate% }` |
| `get_customer_insights` | Top khách hàng theo doanh thu | `[{ name, totalSpent, orderCount }]` |
| `get_food_availability` | Món đang có / hết | `[{ name, category, available }]` |
| `get_delivery_performance` | Hiệu suất shipper | `[{ staffName, delivered, avgTime }]` |
| `get_visit_analytics` | Lượt truy cập theo thời gian | `{ totalVisits, peakHour, trend[] }` |
| `get_category_breakdown` | Doanh thu theo danh mục | `[{ category, revenue, percentage }]` |
| `get_cancellation_analysis` | Phân tích đơn bị hủy | `{ total, topCancelledFoods[], trend[] }` |
| `get_time_series_data` | Chuỗi thời gian cho biểu đồ | `{ labels[], revenue[], orders[] }` |

Yêu cầu khi viết `execute()`:
- Dùng Mongoose aggregation (`$match`, `$group`, `$sort`, `$limit`) — không `.find()` toàn bộ
- `$match` luôn lọc theo `period` (today / week / month / quarter)
- Dùng `.lean()`, không trả raw Mongoose document
- Wrap trong `try/catch`, lỗi trả `{ error: "mô tả lỗi" }`

### Nâng cấp `backend/services/aiService.js`

Thay hàm `askAI` hiện tại bằng vòng lặp 2 bước — **giữ nguyên hàm `callWithFallback`**:

```
Bước 1 — Chọn tool:
  Gửi câu hỏi + danh sách tool definitions lên AI
  AI trả về: { toolCalls: [{ name, parameters }] }

Bước 2 — Viết câu trả lời:
  Backend chạy từng tool, gom kết quả
  Gửi kết quả lên AI lần 2
  AI trả về: { text, chartData, chartType, chartTitle, insight }
```

Thêm 2 system prompt mới vào file này (xem Nâng cấp 2 bên dưới).

---

## NÂNG CẤP 2 — SYSTEM PROMPT CHÍNH XÁC

Thay thế system prompt hiện tại bằng 2 prompt chuyên biệt:

### `SYSTEM_PROMPT_TOOL_SELECTION` (dùng ở Bước 1)

```
Bạn là AI phân tích dữ liệu nhà hàng.
Nhiệm vụ: Chọn tool cần thiết để trả lời câu hỏi của admin.

QUY TẮC:
- Chọn TỐI THIỂU tool cần thiết, không gọi thừa
- Câu hỏi so sánh → thêm parameter "compareWith"
- Câu hỏi xu hướng/biểu đồ → bắt buộc chọn "get_time_series_data"
- Câu hỏi tổng quan → "get_revenue_summary" + "get_order_status_breakdown"
- Câu hỏi nguyên nhân → chọn nhiều tool để đủ góc nhìn

Trả về JSON hợp lệ:
{
  "toolCalls": [{ "name": "tên_tool", "parameters": { "period": "month" } }],
  "reasoning": "1 câu giải thích ngắn"
}
```

### `SYSTEM_PROMPT_ANSWER_WRITER` (dùng ở Bước 2)

```
Bạn là AI phân tích kinh doanh nhà hàng. Viết câu trả lời từ dữ liệu đã có.

PHẢI LÀM:
- Trả lời bằng tiếng Việt, dựa 100% vào dữ liệu cung cấp
- Câu đầu tiên trả lời thẳng vào câu hỏi
- Nêu số cụ thể: "tăng 18%", "123 đơn", "4.500.000đ"
- Ngắn gọn: 3–5 câu, dùng \n- nếu có nhiều điểm
- Trình bày có cấu trúc rõ ràng

TRONG MỌI TRƯỜNG HỢP KHÔNG ĐƯỢC:
- Bịa số liệu không có trong dữ liệu
- Dùng "có thể", "có lẽ" khi đã có số thực
- Lặp lại câu hỏi
- Thêm disclaimer dài dòng

LUÔN trả về JSON (không thêm text ngoài JSON):
{
  "text": "Câu trả lời. Dùng **text** để in đậm số quan trọng. Dùng \n- cho danh sách.",
  "chartData": null | { "labels": [...], "datasets": [{ "label": "...", "data": [...] }] },
  "chartType": null | "bar" | "line" | "pie" | "area",
  "chartTitle": null | "Tiêu đề ngắn",
  "insight": null | "1 nhận xét quan trọng nhất"
}

VẼ BIỂU ĐỒ KHI: so sánh nhiều kỳ → bar/line | xu hướng → area | cơ cấu % → pie
KHÔNG vẽ khi: câu hỏi chỉ có 1 con số đơn giản
```

---

## NÂNG CẤP 3 — GIAO DIỆN CHAT WIDGET

**Yêu cầu bắt buộc:** Đọc CSS hiện tại của admin, tìm CSS variable màu chủ đạo (thường `--primary-color` hoặc `--primary`). Dùng đúng biến đó, không đặt màu mới.

### Xóa và viết lại `AIChatWidget.jsx` + `AIChatWidget.css`

Các tính năng UI cần có:
Floating button (trạng thái đóng):
Hiển thị dạng bong bóng chat nổi góc dưới phải. Không dùng icon mặc định — vẽ SVG inline hình bong bóng chat có thìa + nĩa nhỏ bên trong (phù hợp nhà hàng). Nền màu primary của project. Có badge đỏ nhỏ góc trên phải hiển thị "1" khi chưa đọc welcome message. Khi hover: scale(1.1) + tooltip "Hỏi trợ lý AI". Có hiệu ứng pulse ring xung quanh để thu hút chú ý khi mới load trang (chạy 3 lần rồi dừng).
Floating button (trạng thái mở): Đổi sang icon × có animation xoay 90°.
Header: Tên "Trợ lý AI", subtitle "Phân tích dữ liệu nhà hàng", chấm xanh #4ade80 nhấp nháy nhẹ, nút − thu nhỏ, nút × đóng.
Vùng tin nhắn: Scroll được, background nhạt hơn nền chính, scrollbar mỏng 4px.
Tin nhắn AI: Bubble trái, avatar hình tròn có icon robot/chef nhỏ (SVG), hỗ trợ **bold** → <strong>, \n- → <ul><li>, insight card nền vàng nhạt, biểu đồ nhúng trong bubble.
Tin nhắn User: Bubble phải, màu primary, góc bo tròn trừ góc dưới phải.
Typing indicator: 3 chấm nhảy lần lượt, cùng style bubble AI.
Suggestion chips: Hiện khi mới mở, ẩn sau lần hỏi đầu tiên. Chips có icon emoji + text, hover đổi màu primary.
Input area: Textarea tự giãn cao tối đa 96px, placeholder "Hỏi về doanh thu, đơn hàng...", nút gửi tròn màu primary. Enter gửi, Shift+Enter xuống dòng, Escape đóng widget.
Animation: Widget mở bằng slideUp 0.25s, đóng bằng slideDown 0.2s — không dùng display:none trực tiếp mà dùng class để animation chạy được.
Responsive: Dưới 480px → widget full màn hình, border-radius 0, floating button thu nhỏ còn 44px.

**Welcome message mặc định:**
```javascript
"Xin chào! Tôi có thể giúp bạn phân tích doanh thu, đơn hàng, khách hàng và các số liệu trên dashboard."
```

**Câu hỏi gợi ý:**
```javascript
[
  { icon: "📊", text: "Tóm tắt kinh doanh hôm nay" },
  { icon: "📈", text: "Doanh thu tháng này so với tháng trước?" },
  { icon: "🏆", text: "Top 5 món ăn bán chạy nhất" },
  { icon: "❌", text: "Phân tích đơn hàng bị hủy" },
  { icon: "👥", text: "Khách hàng nào mua nhiều nhất?" },
  { icon: "🚚", text: "Hiệu suất shipper tuần này" },
]
```

### Viết lại `AIChartRenderer.jsx`

Đọc `package.json` xem đang dùng recharts hay chart.js, implement theo đúng thư viện đó. Không cài thêm package mới.

- Chiều cao chart trong bubble: cố định `200px`
- Màu chart: lấy từ CSS variable `--primary-color` của project
- Nếu dùng Chart.js: cleanup `chart.destroy()` trong `useEffect` return

---

## CHECKLIST TỰ KIỂM TRA

**Backend:**
- [ ] `toolRegistry.getAllTools()` trả về đủ 10 tool, không tool nào throw lỗi khi `execute()`
- [ ] `POST /api/ai/chat` → response có `success: true`, `data.text` không rỗng
- [ ] Đổi model đầu thành tên sai → AI vẫn chạy với model tiếp theo (fallback OK)

**Frontend:**
- [ ] Floating button hiển thị, click mở widget có animation
- [ ] Suggestion chips click được, gửi câu hỏi đó
- [ ] Typing indicator 3 chấm xuất hiện khi chờ
- [ ] `**bold**` trong text AI hiển thị đúng
- [ ] Chart render trong bubble khi có `chartData`
- [ ] Màu widget đồng bộ với admin dashboard
- [ ] Mobile 375px: widget full màn hình, dùng được

**Bảo mật:**
- [ ] API key không có trong bất kỳ file frontend nào
- [ ] Route `/api/ai/chat` trả 401 khi thiếu JWT token