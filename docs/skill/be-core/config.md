# SKILL: BACKEND CORE CONFIG

## MỤC TIÊU

Skill này dùng để định hướng AI khi tạo hoặc chỉnh sửa các file cấu hình nền tảng của backend core.

Phạm vi của skill này chỉ bao gồm:

- đọc biến môi trường
- chuẩn hóa cấu hình ứng dụng
- cấu hình kết nối database
- export config để các phần khác dùng lại
- kiểm soát hard-code ở tầng nền tảng

Skill này không bao gồm:

- business config cho nghiệp vụ
- payment config
- booking config
- recommendation config
- chatbot config
- third-party integration config
- frontend config

---

## KHI NÀO DÙNG SKILL NÀY

Dùng skill này khi user yêu cầu:

- tạo `config/env.js`
- tạo `config/db.js`
- setup `.env`
- đọc `process.env`
- gom config dùng chung
- chuẩn hóa config backend core
- sửa lỗi hard-code config
- cấu hình port hoặc mongo uri
- cấu hình jwt secret ở mức nền tảng

Không dùng skill này để xử lý config nghiệp vụ riêng.

---

## PHẠM VI FILE CẤU HÌNH CHUẨN

AI chỉ nên ưu tiên các file sau:

```txt
src/config/env.js
src/config/db.js
.env
.env.example