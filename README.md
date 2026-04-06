# Food-Ordering-Website

Một dự án quản lý và giao đồ ăn bao gồm 3 phần chính: **frontend** (ứng dụng người dùng), **admin** (giao diện quản trị) và **backend** (API + server). Dự án sử dụng Node.js, Express, MongoDB cho backend và Vite + React cho frontend/admin.

---

## Mô tả tổng quan

- Mục tiêu: Hệ thống đặt món trực tuyến cho khách hàng, kèm quản trị viên để quản lý món ăn, đơn hàng và nhân viên giao hàng.
- Tính năng chính:
  - Hiển thị thực đơn, tìm kiếm và phân loại món.
  - Giỏ hàng, tạo đơn hàng, theo dõi đơn hàng.
  - Quản trị viên: thêm/sửa/xóa món, quản lý đơn hàng, quản lý nhân viên giao hàng.
  - Hệ thống xác thực người dùng và phân quyền (user, admin, delivery staff).

---

## Kiến trúc dự án (thư mục chính)

- `backend/` — Server Node.js + Express
  - `server.js` — entrypoint server
  - `config/` — cấu hình DB
  - `controllers/` — logic xử lý cho từng resource
  - `models/` — mô hình Mongoose
  - `routes/` — định nghĩa các route/endpoint
  - `middleware/` — middleware (xác thực...)
  - `uploads/` — nơi lưu file upload (hình ảnh...)
  - `views/` — template EJS cho vài trang server-side (ví dụ: xác nhận giao hàng)

- `frontend/` — Ứng dụng React (user-facing)
  - Vite + React, cấu trúc component tại `src/components` và views tại `src/pages`
  - `src/context/StoreContext.jsx` — context quản lý trạng thái chung

- `admin/` — Ứng dụng quản trị (React + Vite)
  - Bao gồm các component để quản lý AdminAccount, FoodItems, DeliveryStaff, Orders, v.v.
---

## Công nghệ chính

- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend/Admin: React, Vite, CSS (hoặc Tailwind/SCSS tuỳ cấu hình trong project)
- Database: MongoDB
- Khác: EJS templates (một số views), file upload handling

---

## Cài đặt & Chạy (local)

Lưu ý: có ba project con; mỗi phần có `package.json` riêng. Mở 3 terminal hoặc chạy tuần tự.

1) Backend

```bash
cd backend
npm install
# Tạo file .env hoặc kiểm tra file .env hiện có. Không commit secrets.
# Ví dụ biến cần có (tạo file .env nếu chưa có):
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/your-db
# JWT_SECRET=your_jwt_secret
# NODE_ENV=development

npm run dev # hoặc node server.js (tuỳ script trong package.json)
```

2) Frontend (user)

```bash
cd frontend
npm install
npm run dev
```

3) Admin (dashboard)

```bash
cd admin
npm install
npm run dev
```

Build production cho frontend/admin:

```bash
cd frontend
npm run build

cd ../admin
npm run build
```

---

## 🐳 Chạy bằng Docker (không cần cài đặt gì)

✅ **Cách nhanh nhất để chạy toàn bộ dự án chỉ bằng 1 lệnh:**

### Điều kiện trước:
- Đã cài Docker và Docker Compose

### Chạy toàn bộ dự án:
```bash
# Mở terminal ở thư mục gốc
docker-compose up -d
```

✅ Tất cả 3 service sẽ tự động chạy:
| Service | URL |
|---|---|
| Backend API | http://localhost:4000 |
| Frontend (User) | http://localhost:5173 |
| Admin Dashboard | http://localhost:5174 |

### Các lệnh thường dùng:
```bash
# Dừng tất cả containers
docker-compose down

# Xem logs
docker-compose logs -f

# Build lại khi thay đổi code
docker-compose build
docker-compose up -d
```

---

## Biến môi trường (gợi ý)

- `PORT` — cổng server backend
- `MONGO_URI` — connection string MongoDB
- `JWT_SECRET` — secret cho token JWT
- `NODE_ENV` — environment (development/production)
- (Các biến khác tùy theo implement trong `backend/.env` hiện có)

Không lưu các giá trị nhạy cảm vào repo. Tạo file `.env` cục bộ hoặc dùng secret manager khi deploy.

---

## API Overview (endpoint chính)

Backend có các route chính tương ứng với file trong `backend/routes/`:

- `cartRoute.js` — thao tác giỏ hàng (thêm, cập nhật, xóa)
- `commentRoute.js` — bình luận / đánh giá món
- `deliveryStaffOrderRoute.js` — quản lý đơn hàng của nhân viên giao
- `deliveryStaffRoute.js` — quản lý nhân viên giao hàng
- `foodRoute.js` — CRUD món ăn, tìm kiếm, phân loại
- `operatingRoute.js` — các endpoint vận hành (tuỳ dự án)
- `orderRoute.js` — tạo đơn hàng, cập nhật trạng thái đơn
- `userRoute.js` — đăng ký, đăng nhập, quản lý tài khoản
- `visitRoute.js` — ghi nhận lượt truy cập / analytics

Kiểm tra các route cụ thể trong `backend/routes/` để biết method, path và body/response mẫu.

---

## Database

- Sử dụng MongoDB với Mongoose. Các schema nằm trong `backend/models/`.
- Chạy MongoDB cục bộ hoặc sử dụng MongoDB Atlas; cập nhật `MONGO_URI` tương ứng.

---

## Uploads & Views

- Thư mục `backend/uploads/` lưu trữ file ảnh/ tài nguyên upload (tuỳ cấu hình trong server).
- Một số view EJS nằm trong `backend/views/` để hiển thị trang xác nhận/ lỗi.

---

## Bảo mật & Xác thực

- Backend có middleware xác thực (`backend/middleware/auth.js`, `authVer2.js`) — sử dụng JWT.
- Quy tắc phân quyền: user vs admin vs delivery staff. Kiểm tra middleware để biết chi tiết.

---

## Phát triển & Góp phần

- Mẫu workflow:
  1. Fork hoặc tạo branch mới từ `main`/`master`.
  2. Tạo pull request với mô tả thay đổi rõ ràng.

- Đóng góp: mở issue nếu gặp bug hoặc muốn feature mới.

---

## Kiểm thử

- Project hiện không có test tự động trong repo (không tìm thấy thư mục `test` hoặc config CI). Có thể thêm unit/integration tests cho backend (Jest/Supertest) và E2E cho frontend (Cypress).

---

## 🚀 Triển khai lên Production

### 🔹 Backend → Render.com (miễn phí)

Render cho phép host backend Node.js miễn phí với MongoDB Atlas:

1.  **Đăng ký tài khoản Render:** https://render.com/
2.  Chọn `New` → `Web Service`
3.  Connect với repo Github của bạn
4.  **Cấu hình:**
    - **Root Directory:** `backend`
    - **Build Command:** `npm install && npm run build` (hoặc `npm install`)
    - **Start Command:** `node server.js`
    - **Plan:** `Free`
5.  **Thêm biến môi trường (Environment Variables):**
    Sao chép tất cả biến từ file `backend/.env` vào đây:
    ```
    JWT_SECRET=random#secret
    STRIPE_SECRET_KEY=your_stripe_key
    DB=mongodb+srv://your-mongodb-atlas-uri
    HOST=smtp.gmail.com
    USER=your-email@gmail.com
    PASS=your-app-password
    SERVICE=gmail
    BASE_URL=https://your-backend-url.onrender.com
    OPENROUTER_API_KEY=sk-or-v1-...
    OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
    OPENROUTER_SITE_URL=https://your-frontend-url.vercel.app
    OPENROUTER_SITE_NAME=Food Delivery App
    ```
6.  Click `Deploy` → backend sẽ được deploy trong ~2 phút

---

### 🔹 Frontend + Admin → Vercel (miễn phí)

Tạo 2 project riêng biệt trên Vercel cho frontend và admin:

#### ✅ Deploy Frontend (User):
1.  Mở Vercel → Add New → Project
2.  Connect Github repo
3.  **Cấu hình:**
    - **Root Directory:** `frontend`
    - **Framework Preset:** `Vite`
    - **Environment Variables:** (nếu cần)
4.  Click `Deploy`

#### ✅ Deploy Admin Dashboard:
1.  Tạo project mới trên Vercel
2.  Connect cùng Github repo
3.  **Cấu hình:**
    - **Root Directory:** `admin`
    - **Framework Preset:** `Vite`
4.  Click `Deploy`

---

### ✅ Sau khi deploy xong:
1.  Mở `frontend/src/context/StoreContext.jsx` → đổi `const url = "http://localhost:4000"` thành URL backend trên Render
2.  Mở `admin/src/constants/data.js` → đổi `export const url = "http://localhost:4000"` thành URL backend trên Render
3.  Commit và push code lên Github → Vercel sẽ auto deploy lại

---

## Vấn đề thường gặp & Debug

- Lỗi kết nối DB: kiểm tra `MONGO_URI` và trạng thái MongoDB.
- Lỗi CORS khi frontend gọi API: đảm bảo backend cấu hình CORS hoặc proxy dev.

---

## Tài liệu tham khảo trong repo

- Mã nguồn backend: `backend/`
- Mã nguồn frontend (user): `frontend/`
- Mã nguồn admin: `admin/`

---

## License

Không có file `LICENSE` trong repo hiện tại. Nếu muốn, thêm `LICENSE` (ví dụ MIT) và cập nhật README.

---

## Người liên hệ

- Thêm thông tin liên hệ hoặc hồ sơ maintainer trong file `README` hoặc `package.json` nếu cần.

---

## Tiếp theo (gợi ý từ tôi)

- Tạo file `.env.example` với các biến môi trường cần thiết.
- Thêm script `start`/`dev` rõ ràng trong từng `package.json` (nếu thiếu).
- Tạo tài liệu API (OpenAPI/Swagger) từ các route hiện có.
