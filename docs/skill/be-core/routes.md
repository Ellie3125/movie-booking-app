# SKILL: ROUTE STRUCTURE

## MỤC TIÊU

Chuẩn hóa cách định nghĩa route backend core.

## PHẠM VI

- routes/index.js
- module route cơ bản

Không bao gồm:
- business logic

## QUY TẮC

### route chỉ làm:

- định nghĩa endpoint
- gắn middleware
- gọi controller

### route không được:

- viết logic xử lý
- query DB
- xử lý dữ liệu

## FILE CHUẨN

routes/
- index.js
- auth.routes.js (nếu có yêu cầu)
- user.routes.js (nếu có yêu cầu)

## INDEX ROUTE

- gom tất cả route
- prefix API (/api/v1)

## KIỂM TRA

- route gọi đúng controller
- không có logic trong route
- endpoint rõ nghĩa

## KHÔNG ĐƯỢC

- tạo route cho mọi module khi chưa cần
- viết logic trực tiếp trong route