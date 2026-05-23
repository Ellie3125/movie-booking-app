# RULES.md - Project Standards

## 1. Global Rules

*   **Architecture Integrity**: Không tự ý tạo ra kiến trúc mới. Tái sử dụng các mẫu (patterns) hiện có.
*   **Minimal Changes**: Tránh các thay đổi lớn không cần thiết. Giữ cách đặt tên nhất quán.
*   **No Placeholders**: Tuyệt đối không để lại mã `TODO` hoặc mã tạm thời.
*   **Verification**: Luôn xác minh việc build, lint và runtime trước khi hoàn tất.
*   **Modification Flow**: Đọc các tệp liên quan -> Hiểu cấu trúc -> Tái sử dụng các mẫu -> Giải thích các thay đổi.
*   **SPEC Disclosure Requirement**: Mỗi khi nhận đặc tả `<SPEC>` và tiến hành viết mới hoặc chỉnh sửa file code, bắt buộc phải cung cấp phần giải trình gồm đủ 4 mục: **Autonomous Decisions**, **Deviations**, **Trade-offs**, và **Context/Notes**. Đặt phần này ở đầu file dưới dạng comment block nếu phù hợp với file/codebase, hoặc bắt buộc đưa vào báo cáo kết quả trả về nếu comment đầu file không phù hợp.
*   **Triết lý Superpowers**:
    *   **Phát triển hướng kiểm thử (TDD)**: Luôn viết kiểm thử trước khi viết mã nguồn.
    *   **Hệ thống thay vì cảm tính**: Tuân thủ quy trình thay vì phỏng đoán.
    *   **Giảm thiểu sự phức tạp**: Coi sự đơn giản là mục tiêu hàng đầu.
    *   **Bằng chứng thay vì khẳng định**: Xác minh kết quả thực tế trước khi tuyên bố thành công.

---

## 2. Backend (Node.js + Express + MongoDB)

*   **Libraries**: Use `jsonwebtoken` for tokens, `cookie-parser` for cookies, and `joi` for validation.
*   **Architecture**: Strict MVC + Service Layer.
*   **Thin Controllers**: Controllers only handle req/res and call services.
*   **Service Layer**: All business logic and DB operations must reside here.
*   **Models**: Clean Mongoose schemas. No complex logic.
*   **Responses**: Use the standard `Success` and `Error` formats (see below).
*   **Validation**: Always validate request body/params (e.g., using a validation middleware).
*   **Security**: Never expose sensitive data (passwords, etc.).
*   **Async**: Use `asyncHandler` for all async routes to ensure proper error forwarding.

---

## 3. Admin Web (React + TypeScript + TailAdmin)

*   **Libraries**: Use `axios` for API calls, `dayjs` for dates, and `localStorage` for token storage.
*   **Token Storage**: Must follow the pattern in `src/api/axios.ts` using `localStorage.getItem('accessToken')`.
*   **Tech Stack**: React components with strong TypeScript typing.
*   **UI System**: Use TailAdmin components and layout system.
*   **Typing**: Define Interfaces/Types for all API responses and component props.
*   **State Management**: Use hooks (useState, useEffect, custom hooks) effectively.
*   **Reusability**: Create reusable Table, Form, and Modal components.
*   **Design**: Maintain professional, dashboard-style aesthetics (premium dark/light modes).

---

## 4. HTML/CSS Implementation (Standalone HTML)

*   **Required Skill**: Khi tạo mới hoặc chỉnh sửa file HTML/CSS độc lập, phải dùng skill `.agents/skills/html-implement/`.
*   **Pattern Reuse First**: Luôn đọc và tái sử dụng CSS variables, utilities và component classes trong `.agents/skills/html-implement/css-patterns.md`.
*   **No Invented Tokens**: Không tự ý bịa biến custom mới nếu hệ thống đã có token phù hợp như `--color-accent`, `--sp-4`, `--r-md`, `--shadow-sm`.
*   **Targeted HTML Edits**: Khi sửa file HTML hiện có, tuyệt đối không rewrite toàn bộ file hoặc paste lại các block CSS dài. Dùng thay thế có mục tiêu (`str_replace`-style; trong Codex dùng `apply_patch` hunk nhỏ) để thêm đúng class như `.btn-primary`, `.badge-green`, `.table`, `.table-wrap`, `.card`, `.input`.
*   **Workflow B Discipline**: Đọc `css-patterns.md` trước, đọc file HTML hiện tại sau, rồi chỉ sửa đúng phần cần thay đổi.
*   **Pre-Output Checklist**: Trước khi giao file HTML, kiểm tra `lang`, viewport meta, heading semantic, `alt`, labels, responsive ở 375px/1280px, dark-mode tokens nếu có, và vanilla JS tách `state` / `render` / `events`.

---

## 5. Mobile App (React Native + Expo)

*   **Libraries**: Use `expo-secure-store` for tokens, `expo-location` for location, and `axios` for API.
*   **Token Storage**: Must use `lib/tokenStorage.ts` (wraps `expo-secure-store`).
*   **Location**: Always use `expo-location` for retrieving user position.
*   **Tech Stack**: React Native components managed via Expo.
*   **Navigation**: Maintain a smooth, intuitive booking flow.
*   **Performance**: Optimize seat map rendering. Avoid heavy re-renders.
*   **UI/UX**: Ensure touch targets are accessible (>= 44px).
*   **Responsiveness**: Layouts must work across various screen sizes (iOS/Android).
*   **Transitions**: Use subtle animations for screen transitions and interactions.

---

## Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Internal error details (dev mode only)"
}
```

---

## AI Generation Workflow

1.  **Analyze**: Understand requirements and check current code.
2.  **Plan**: Identify affected files and explain the approach.
3.  **Implement**: Write clean, consistent, and commented code.
4.  **Explain**: Detail the changes and how the logic flows.
5.  **SPEC Disclosure**: Nếu task xuất phát từ `<SPEC>` và có chỉnh code, báo cáo bắt buộc gồm:
    *   **Autonomous Decisions**: Quyết định AI tự ra mà spec không nói.
    *   **Deviations**: Chỗ AI phải đổi hoặc làm khác yêu cầu ban đầu.
    *   **Trade-offs**: Các đánh đổi đã cân nhắc trước khi chọn giải pháp.
    *   **Context/Notes**: Lưu ý quan trọng, rủi ro, cấu trúc code hoặc hướng mở rộng.
6.  **Verify**: Provide a checklist for testing and mention risks.
