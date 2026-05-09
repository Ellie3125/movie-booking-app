# BeatCinema - Hệ sinh thái Đặt vé Xem phim

BeatCinema là một hệ thống đặt vé xem phim toàn diện, được thiết kế để mang lại trải nghiệm người dùng mượt mà và khả năng quản trị mạnh mẽ.

## 🚀 Hệ sinh thái Dự án

Dự án được chia thành ba thành phần cốt lõi:

1.  **Phần 1: Backend (Core API)**
    *   **Công nghệ**: Node.js, Express, MongoDB, Mongoose.
    *   **Tiêu chuẩn**: Kiến trúc MVC nghiêm ngặt + Service Layer.
    *   **Thư viện chính**: `jsonwebtoken` (Auth), `joi` (Validation), `cookie-parser`, `bcryptjs`.
    *   **API Prefix**: `/api/v1`

2.  **Phần 2: Admin Web (Trình quản trị)**
    *   **Công nghệ**: React, TypeScript, Vite, TailAdmin.
    *   **Mục tiêu**: Giao diện quản lý chuyên nghiệp với số liệu thống kê thời gian thực.
    *   **Tính năng**: Quản lý Phim/Rạp (CRUD), Trình chỉnh sửa sơ đồ ghế, Quản lý suất chiếu, Theo dõi đặt vé và người dùng.

3.  **Phần 3: Mobile App (Ứng dụng cho khách hàng)**
    *   **Công nghệ**: React Native, Expo, TypeScript.
    *   **Thư viện**: `expo-secure-store` (Lưu trữ Token), `expo-location`, `axios`, `react-native-reanimated`.
    *   **Luồng hoạt động**: Khám phá phim -> Chọn Rạp/Suất chiếu -> Sơ đồ ghế tương tác -> Thanh toán an toàn -> Vé điện tử.

---

## 🛠 Tổng hợp Công nghệ

| Thành phần | Công nghệ chính |
| :--- | :--- |
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **Admin Web** | React, TypeScript, TailAdmin, Vite |
| **Mobile App** | React Native, Expo, TypeScript |
| **Styling** | Tailwind CSS (Admin/Web), Native Styling (Mobile) |
| **Database** | MongoDB Atlas / Local MongoDB |

---

## 🏃 Hướng dẫn Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/Ellie3125/movie-booking-app.git
cd movie-booking-app
```

### 2. Thiết lập Backend
```bash
cd backend
npm install
# Tạo file .env dựa trên .env.example
npm run dev
```

### 3. Thiết lập Admin Web
```bash
cd admin-web
npm install
npm run dev
```

### 4. Thiết lập Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

---

## 🤖 Tiêu chuẩn AI Coding

Dự án này sử dụng các AI agent **Antigravity** và **Codex** để phát triển. Tất cả các hướng dẫn, quy tắc và kỹ năng liên quan đến AI được duy trì trong thư mục [`.agents/`](file:///d:/Project_Mobile/movie-booking-app/.agents):
- `RULES.md`: Tiêu chuẩn code và định dạng phản hồi API.
- `SKILLS.md`: Các năng lực chuyên biệt của AI.
- `PROJECT_CONTEXT.md`: Bối cảnh nghiệp vụ và kỹ thuật chuyên sâu.

---

## 📝 Giấy phép
Dự án này được xây dựng cho mục đích học tập và làm danh mục dự án cá nhân (portfolio).
