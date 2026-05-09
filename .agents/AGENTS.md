# AGENTS.md - Movie Booking App AI Instructions

## 1. Project Overview & Tech Stack

This is a comprehensive cinema ticket booking ecosystem divided into three main parts:

1.  **Backend (BE)**: Node.js, Express, MongoDB (Mongoose), `jsonwebtoken`, `joi`.
2.  **Admin Web**: React, TypeScript, TailAdmin, `axios`, `localStorage`.
3.  **Mobile App**: React Native, Expo, `expo-secure-store`, `expo-location`.

---

## 2. Part 1: Backend (Core API)

*   **Standard**: MVC + Service Layer.
*   **Goal**: Scalable, secure, and performant API.
*   **Key Responsibilities**:
    *   Auth (JWT), Booking Logic, Seat Locking.
    *   Payment Simulation, Statistics Generation.
    *   CRUD for Movies, Cinemas, Showtimes.

---

## 3. Part 2: Admin Web (Management)

*   **Standard**: React + TS + TailAdmin.
*   **Goal**: Powerful, easy-to-use management interface.
*   **Key Responsibilities**:
    *   Real-time dashboard statistics.
    *   Complex Seat Layout Editor.
    *   Bulk management for Showtimes and Users.
    *   Media upload handling.

---

## 4. Part 3: Mobile App (Customer Experience)

*   **Standard**: React Native + Expo.
*   **Goal**: Premium, smooth, and bug-free booking experience.
*   **Key Responsibilities**:
    *   Intuitive movie discovery.
    *   Interactive seat selection (high performance).
    *   Smooth booking flow (Select Movie -> Cinema -> Showtime -> Seat -> Pay -> Ticket).
    *   Personalized profiles and booking history.

---

## 5. Các quy tắc hành vi cốt lõi (Core AI Behavior Rules)

1.  **Context First**: Luôn đọc `PROJECT_CONTEXT.md` và các tệp liên quan trước khi thực hiện bất kỳ hành động nào.
2.  **Consistency**: Tuân thủ các mẫu (patterns) đã thiết lập cho từng phần (ví dụ: TS cho Admin, MVC cho BE).
3.  **Incremental**: Thực hiện các thay đổi nhỏ, an toàn. Giải thích lý do ("tại sao") và cách thức ("làm thế nào").
4.  **No Deletions**: Không bao giờ âm thầm xóa bỏ các tính năng hoặc cấu hình hiện có.
5.  **Professional UI**: Mọi thay đổi UI phải mang lại cảm giác "Cao cấp" (Premium) và "Hiện đại" (Modern).
6.  **Verify Everything**: Sử dụng các công cụ xác minh trước khi tuyên bố hoàn thành công việc.

---

## 6. Tiêu chuẩn chất lượng cao (High Quality Standards)

*   **Tránh mã nguồn kém chất lượng**: Không thực hiện các thay đổi mã nguồn cẩu thả hoặc chưa được kiểm chứng.
*   **Xác minh vấn đề**: Chỉ giải quyết các vấn đề thực tế, có thật. Luôn xác nhận với người dùng nếu có nghi ngờ.
*   **Minh bạch**: Luôn hiển thị diff đầy đủ và giải thích rõ ràng các thay đổi quan trọng.
*   **Tuân thủ quy trình**: Luôn sử dụng các kỹ năng trong `.agents/skills/workflow` (Brainstorming, Planning, TDD, v.v.) cho các nhiệm vụ phức tạp.
