# SKILL: SERVER BOOTSTRAP

## MỤC TIÊU

Chuẩn hóa cách AI tạo file `server.js`.

## PHẠM VI

- load env
- connect database
- start server

Không bao gồm:
- route
- controller
- middleware

## QUY TẮC

### server.js chỉ được làm:

- require dotenv
- import app
- import connectDB
- connect DB
- start server

### server.js không được:

- viết route
- viết controller
- viết middleware

## FLOW CHUẨN

- load env
- connect DB
- app.listen

## LOG

- log port
- log trạng thái DB (nếu cần)

## KIỂM TRA

- không có logic nghiệp vụ
- không có express setup
- không có route definition