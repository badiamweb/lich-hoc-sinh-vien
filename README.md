# 🎓 Hệ Thống Quản Lý Thời Khóa Biểu Sinh Viên

Web app quản lý thời khóa biểu dạng bảng, giao diện giống cổng thông tin sinh viên Việt Nam.

---

## 📦 Cấu Trúc Dự Án

```
timetable-app/
├── frontend/          ← React + Vite (StudentTimetable.jsx)
└── backend/           ← Node.js + Express + MongoDB
    ├── src/
    │   └── index.js
    └── package.json
```

---

## 🚀 Chạy Frontend (React Artifact)

File `StudentTimetable.jsx` có thể chạy ngay trên **Claude.ai** như một artifact,
hoặc tích hợp vào project Vite:

```bash
npm create vite@latest timetable-frontend -- --template react
cd timetable-frontend
npm install
# Copy StudentTimetable.jsx vào src/App.jsx
npm run dev
```

> ✅ Frontend tự lưu dữ liệu vào **localStorage** — không bị mất khi reload.

---

## 🗄️ Chạy Backend

### 1. Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc MongoDB Atlas)

### 2. Cài đặt

```bash
cd backend
npm install
```

### 3. Tạo file `.env`

```env
MONGO_URI=mongodb://localhost:27017/timetable
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

### 4. Chạy server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

### 5. Seed dữ liệu mẫu

```bash
curl -X POST http://localhost:5000/api/seed
```

Tạo sẵn:
- 👤 Admin: `admin` / `admin123`
- 👤 Sinh viên: `sv001` / `sv123`
- 3 môn học + 3 phòng + lịch mẫu

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Tạo tài khoản |

**Login request:**
```json
{ "username": "admin", "password": "admin123" }
```
**Response:** `{ "token": "...", "role": "admin", "username": "admin" }`

> Dùng token trong header: `Authorization: Bearer <token>`

---

### Subjects (Môn học)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/subjects` | — | Lấy tất cả môn |
| POST | `/api/subjects` | Admin | Tạo môn mới |
| PUT | `/api/subjects/:id` | Admin | Cập nhật môn |
| DELETE | `/api/subjects/:id` | Admin | Xóa môn |

**POST body:**
```json
{ "name": "Lập Trình Web", "teacher": "TS. Nguyễn Văn A", "colorIdx": 0 }
```

---

### Rooms (Phòng học)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/rooms` | — | Lấy tất cả phòng |
| POST | `/api/rooms` | Admin | Tạo phòng mới |
| DELETE | `/api/rooms/:id` | Admin | Xóa phòng |

---

### Schedule (Thời khóa biểu)

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/schedule` | — | Lấy toàn bộ lịch |
| POST | `/api/schedule` | Admin | Thêm lịch (có kiểm tra trùng) |
| PUT | `/api/schedule/:id` | Admin | Sửa lịch |
| DELETE | `/api/schedule/:id` | Admin | Xóa lịch |

**POST body:**
```json
{
  "subjectId": "65abc...",
  "roomId": "65def...",
  "day": 1,
  "startTime": 7,
  "endTime": 9
}
```

> `day`: 1 = Thứ 2, ..., 6 = Thứ 7  
> `startTime` / `endTime`: số nguyên từ 7 → 18

**Conflict response (409):**
```json
{ "error": "Schedule conflict detected" }
```

---

## 🗄️ Database Schema (MongoDB)

```
User:     { username, password (bcrypt), role: admin|student }
Subject:  { name, teacher, colorIdx }
Room:     { name }
Schedule: { subjectId→Subject, roomId→Room, day(1-6), startTime, endTime }
```

---

## 🎨 Tính Năng

### Admin
- ✅ Đăng nhập (JWT)
- ✅ CRUD môn học + phòng học
- ✅ Thêm / sửa / xóa lịch học
- ✅ Kiểm tra trùng lịch (cả frontend lẫn backend)
- ✅ Dữ liệu lưu localStorage (frontend) / MongoDB (backend)

### Sinh Viên
- ✅ Xem thời khóa biểu dạng bảng
- ✅ Click môn học để xem chi tiết
- ✅ Highlight ngày hiện tại
- ✅ Responsive mobile

---

## 🔗 Kết Nối Frontend ↔ Backend

Trong `StudentTimetable.jsx`, thay `useLocalStorage` bằng API calls:

```js
// Lấy lịch từ backend
const res = await fetch("http://localhost:5000/api/schedule");
const data = await res.json();

// Thêm lịch (admin)
await fetch("http://localhost:5000/api/schedule", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(form)
});
```

---

## 💡 Bonus Features (Có thể mở rộng)

- [ ] Drag & drop lịch học (react-beautiful-dnd)
- [ ] Export PDF (react-pdf / jspdf)
- [ ] Filter theo phòng / giảng viên
- [ ] Thông báo lịch học hôm nay
- [ ] Dark mode
