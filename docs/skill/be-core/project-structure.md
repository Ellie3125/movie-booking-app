# SKILL: BACKEND CORE PROJECT STRUCTURE

## MỤC TIÊU

Skill này dùng để buộc AI chỉ tạo hoặc chỉnh sửa **cấu trúc nền tảng của backend core**.

Phạm vi của skill này chỉ bao gồm:

- thư mục nền tảng của backend
- file khởi động app
- file khởi động server
- chia layer MVC cơ bản
- config nền tảng
- middleware nền tảng
- utils nền tảng

Skill này không bao gồm:

- business logic nghiệp vụ
- booking
- payment
- seat processing
- recommendation
- chatbot
- frontend
- mobile
- tích hợp bên thứ ba

---

## KHI NÀO DÙNG SKILL NÀY

Dùng skill này khi user yêu cầu một trong các việc sau:

- tạo cấu trúc thư mục backend
- setup backend ban đầu
- tạo `app.js`
- tạo `server.js`
- chia thư mục MVC
- tổ chức lại backend core
- bổ sung folder nền tảng như `config`, `middlewares`, `utils`
- rà soát cấu trúc project backend hiện tại

Không dùng skill này để xử lý chi tiết nghiệp vụ.

---

## PHẠM VI CẤU TRÚC CHUẨN

AI phải ưu tiên cấu trúc tối giản, rõ ràng, đúng MVC:

```txt
backend/
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
    services/
    utils/
    app.js
    server.js
    