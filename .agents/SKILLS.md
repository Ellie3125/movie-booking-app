# SKILLS.md - Kỹ năng của Agent

## Luật ưu tiên cao nhất cho SPEC/Plans

* Mọi task code xuất phát từ `<SPEC>` bắt buộc có 4 mục giải trình: **Autonomous Decisions**, **Deviations**, **Trade-offs**, **Context/Notes**.
* Mọi specs và implementation plans mới trong dự án phải được viết/lưu bằng HTML.
* Tài liệu HTML spec/plan phải dùng chung CSS variables/classes từ `.agents/skills/html-implement/css-patterns.md`.
* Các luật trên đứng trước mọi workflow skill khác nếu có xung đột.

## Kỹ năng quy trình (Workflow Skills)

Vị trí: `.agents/skills/workflow/`

Sử dụng các kỹ năng này trong quá trình phát triển:

### brainstorming (Động não)
Sử dụng trước khi:
* Phát triển các tính năng lớn
* Thay đổi kiến trúc
* Thiết kế lại schema
* Thiết kế lại giao diện người dùng (UI) quy mô lớn

Yêu cầu:
* Phân tích mã nguồn hiện tại trước
* Cung cấp các lựa chọn và đánh giá ưu nhược điểm
* Tránh viết mã ngay lập tức

---

### writing-plans (Viết kế hoạch thực hiện)
Sử dụng trước khi:
* Sửa đổi nhiều tệp
* Đồng bộ hóa backend/frontend
* Triển khai tính năng phức tạp

Yêu cầu:
* Các bước rõ ràng
* Liệt kê các tệp bị ảnh hưởng
* Không sử dụng các TODO mơ hồ
* Kế hoạch thực hiện có thể hành động ngay

---

### systematic-debugging (Gỡ lỗi hệ thống)
Sử dụng khi:
* Có lỗi runtime
* Lỗi API
* Vấn đề về trạng thái (state)
* Vấn đề hiển thị (rendering)

Yêu cầu:
* Tái hiện lỗi
* Kiểm tra log/lỗi
* Xác định nguyên nhân gốc rễ
* Xác minh bản sửa lỗi cuối cùng

---

### test-driven-development (Phát triển hướng kiểm thử - TDD)
Sử dụng chủ yếu cho:
* Logic đặt vé
* Logic thanh toán
* Logic chọn ghế
* Các dịch vụ backend quan trọng

Quy trình:
1. Viết kiểm thử lỗi (failing test)
2. Triển khai mã tối thiểu để vượt qua kiểm thử
3. Refactor (tối ưu mã) một cách an toàn

---

### verification-before-completion (Xác minh trước khi hoàn tất)
Sử dụng trước khi kết thúc bất kỳ nhiệm vụ nào.

Xác minh:
* Build
* Lint
* Runtime (chạy thực tế)
* Hành vi đáp ứng (responsive)
* Các lỗi phát sinh (regressions)

---

### requesting-code-review (Yêu cầu nhận xét mã)
Sử dụng trước khi:
* Merge (hợp nhất)
* Release (phát hành)
* Các commit lớn

Kiểm tra:
* Khả năng bảo trì
* Tính nhất quán
* Hiệu năng
* Khả năng đọc hiểu
* Các lỗi phát sinh

---

### subagent-driven-development (Phát triển dựa trên subagent)
Sử dụng khi:
* Thực hiện kế hoạch với các nhiệm vụ độc lập
* Tận dụng các agent chuyên biệt cho từng tác vụ

---

### executing-plans (Thực thi kế hoạch)
Sử dụng khi:
* Có một kế hoạch thực hiện đã được phê duyệt và cần thực hiện từng bước với các điểm kiểm tra.

---

### finishing-a-development-branch (Hoàn tất nhánh phát triển)
Sử dụng khi:
* Quá trình triển khai hoàn tất, tất cả các bài kiểm tra đều vượt qua và cần tích hợp công việc.

---

### using-git-worktrees (Sử dụng git worktrees)
Sử dụng khi:
* Cần làm việc trên nhiều nhánh song song mà không làm ảnh hưởng đến thư mục làm việc chính.

---

### receiving-code-review (Nhận nhận xét mã)
Sử dụng khi:
* Phản hồi các ý kiến đóng góp từ quá trình review mã.

---

### writing-skills (Viết kỹ năng mới)
Sử dụng khi:
* Tạo ra các kỹ năng mới cho agent theo các thực hành tốt nhất.

---

## Phần 1: Kỹ năng Backend

### be-core
Vị trí: `.agents/skills/be-core/`

Sử dụng cho:
* Thiết lập cấu trúc backend
* Tạo bootstrap cho ứng dụng/server
* Định nghĩa các lớp MVC (Model, Service, Controller, Route)
* Cấu hình cơ sở dữ liệu hoặc môi trường
* Tạo các middleware chuẩn (xử lý lỗi, không tìm thấy trang)

Yêu cầu:
* Tuân thủ nghiêm ngặt sự phân tách MVC
* Sử dụng định dạng phản hồi chuẩn
* Giữ logic trong các service
* Sử dụng asyncHandler cho tất cả các hoạt động không đồng bộ

---

## Phần 2 & 3: Kỹ năng Frontend & Mobile

### html-implement
Vị trí: `.agents/skills/html-implement/`

Sử dụng cho:
* Tạo mới file HTML độc lập
* Sửa hoặc mở rộng file HTML hiện có
* Áp dụng CSS variables, utilities và component patterns có sẵn
* Tối ưu token khi chỉnh HTML/CSS bằng cách dùng class pattern thay vì viết lại CSS dài

Yêu cầu:
* Luôn đọc `.agents/skills/html-implement/css-patterns.md` trước khi sửa HTML/CSS
* Không tự tạo design tokens mới nếu pattern đã có
* Khi sửa HTML, dùng thay đổi có mục tiêu (`str_replace`-style; trong Codex dùng `apply_patch` hunk nhỏ), không rewrite toàn bộ file
* Ưu tiên class như `.btn-primary`, `.badge-green`, `.table`, `.table-wrap`, `.card`, `.input`
* Kiểm tra checklist HTML/CSS/JS trước khi hoàn tất

---

### ui-ux-pro-max
Vị trí: `.agents/skills/ui-ux-pro-max/`

Sử dụng cho:
* Dashboard quản trị
* Quy trình đặt vé
* Trình chỉnh sửa sơ đồ ghế
* Modals/Forms
* Trang thống kê
* Các màn hình ứng dụng di động

---

## Kỳ vọng về UI/UX

Áp dụng:
* Thiết kế hiện đại cao cấp
* Tính nhất quán về khoảng cách (spacing)
* Phân cấp kiểu chữ (typography)
* Các tương tác nhỏ (micro interactions) mượt mà
* Bố cục đáp ứng (responsive)
* Các thành phần có thể tái sử dụng

Tránh:
* Sử dụng kiểu mặc định
* Khoảng cách không nhất quán
* Giao diện lộn xộn
* Các thành phần có kích thước quá lớn
