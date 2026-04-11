# SKILL: APP BOOTSTRAP

## MỤC TIÊU

Chuẩn hóa cách AI tạo file `app.js` cho backend core.

## PHẠM VI

- express app
- base middleware
- route root
- not found middleware
- error middleware

Không bao gồm:
- business logic
- database connection
- server listen
- cron
- external integration

## QUY TẮC

### app.js chỉ được làm:

- tạo express app
- dùng express.json()
- dùng cors()
- mount routes
- dùng notFound middleware
- dùng error middleware
- export app

### app.js không được:

- listen port
- connect DB
- viết controller logic
- viết service logic

## FLOW CHUẨN

app.js:
- create app
- use middleware
- register routes
- handle not found
- handle error
- export app

## IMPORT

- express
- cors (nếu cần)
- routes/index.js
- middlewares/error.middleware.js
- middlewares/notFound.middleware.js

## RESPONSE

Không xử lý response trực tiếp tại app.js.

## KIỂM TRA

- không có app.listen
- không có connectDB
- không có logic nghiệp vụ
- thứ tự middleware đúng