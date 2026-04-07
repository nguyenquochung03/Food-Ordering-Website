# AI Chatbot Admin Dashboard - Giải thích chi tiết cách hoạt động

## Tổng quan
Đây là hệ thống chatbot AI tích hợp vào dashboard admin, giúp phân tích dữ liệu kinh doanh nhà hàng, trả lời câu hỏi tự nhiên và hiển thị biểu đồ trực quan.

---

## 📁 Vị trí file code

| Chức năng | Đường dẫn file |
|-----------|----------------|
| Component chính chatbot | `admin/src/components/AIChatWidget/AIChatWidget.jsx` |
| Component render biểu đồ | `admin/src/components/AIChartRenderer/AIChartRenderer.jsx` |
| Backend API Endpoint | `backend/routes/ai.route.js` |
| Service xử lý AI | `backend/services/ai.service.js` |

---

## 🔄 Luồng hoạt động đầy đủ

### 1. Khởi tạo chatbot
```
✅ Mở chatbot
  ↳ Kiểm tra nếu chưa có tin nhắn
  ↳ Tự động gửi tin nhắn chào đầu tiên
  ↳ Hiển thị các câu hỏi gợi ý
```

### 2. Người dùng gửi câu hỏi
```
✅ Người dùng nhập nội dung + nhấn Gửi
  ↳ Thêm tin nhắn người dùng vào giao diện ngay lập tức
  ↳ Xóa nội dung input
  ↳ Bật trạng thái loading
```

### 3. Chuẩn bị lịch sử hội thoại (QUAN TRỌNG - phần đã fix lỗi)
> ❌ Lỗi cũ: Gửi toàn bộ object tin nhắn bao gồm cả `chartData`, `chartType` -> AI nhận JSON thô và trả về hiển thị ra
>
> ✅ Hiện tại: Chỉ gửi text nội dung tin nhắn theo chuẩn OpenAI format:
```javascript
const history = messages.map((m) => {
  let content = m.text;
  
  if (m.role === 'assistant' && m.chartData) {
    // Chỉ gửi text nội dung, không gửi metadata UI
    content = m.text;
    if (m.insight) {
      content += '\n' + m.insight;
    }
  }
  
  return { role: m.role, content };
});
```

### 4. Gọi API Backend
```
✅ Gửi request POST `/api/ai/chat`
  Header: `token` JWT admin
  Body:
    - message: Câu hỏi người dùng
    - history: Lịch sử hội thoại đã clean
```

### 5. Backend xử lý (Luồng Function Calling AI thực tế)
```
✅ Kiểm tra quyền admin
  ↳ Gọi LLM qua Open Router với prompt hệ thống
  ↳ AI quyết định xem cần gọi API nào để lấy dữ liệu (function calling)
  ↳ Backend gọi chính xác API nội bộ lấy dữ liệu thực từ Database
  ↳ Backend gửi kết quả dữ liệu vừa lấy được ngược lại cho AI
  ↳ AI phân tích dữ liệu, tạo nội dung trả lời, tạo cấu trúc biểu đồ
  ↳ AI trả về dữ liệu cấu trúc chuẩn:
    {
      text: "Nội dung trả lời dễ đọc cho người dùng",
      chartData: { ... cấu trúc biểu đồ chuẩn chart.js ... },
      chartType: "bar/line/pie",
      chartTitle: "Tên biểu đồ",
      insight: "Phân tích chuyên sâu, nhận định kinh doanh"
    }
  ↳ Backend trả về response client
```

### 6. Client nhận và render
```
✅ Nhận response từ server
  ↳ Tạo object tin nhắn assistant
  ↳ Thêm vào mảng messages
  ↳ Render:
    → Text nội dung bằng ReactMarkdown
    → Nếu có chartData -> render biểu đồ bằng AIChartRenderer
  ↳ Tắt trạng thái loading
  ↳ Auto scroll xuống cuối
```

---

## 🎯 Các tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| ✅ Giao diện fullscreen | Mở rộng toàn màn hình khi sử dụng |
| ✅ Câu hỏi gợi ý | Hiển thị 15 câu hỏi phổ biến khi mới mở |
| ✅ Auto scroll | Tự động cuộn xuống khi có tin nhắn mới |
| ✅ Loading state | Hiển thị hiệu ứng chờ khi AI đang trả lời |
| ✅ Hỗ trợ nhiều loại biểu đồ | Bar, Line, Pie chart |
| ✅ Markdown support | Hiển thị định dạng text, danh sách, bold... |
| ✅ Ngắt kết nối xử lý lỗi | Xử lý trường hợp server lỗi hoặc mất kết nối |
