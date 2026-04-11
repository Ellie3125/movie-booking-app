# SKILL: BASE MIDDLEWARE

## MỤC TIÊU

Chuẩn hóa middleware nền tảng backend core.

## PHẠM VI

- error middleware
- not found middleware
- async handler

Không bao gồm:
- business middleware
- role-based auth nâng cao
- logging phức tạp

## FILE CHUẨN

middlewares/
- error.middleware.js
- notFound.middleware.js

utils/
- asyncHandler.js

## QUY TẮC

### error middleware

- nhận (err, req, res, next)
- trả response chuẩn
- không trả stack cho production

### notFound middleware

- xử lý route không tồn tại
- tạo error và forward

### asyncHandler

- wrap async function
- bắt lỗi và forward next

## KHÔNG ĐƯỢC

- viết business logic trong middleware
- xử lý DB trong middleware
- tạo middleware phức tạp nếu chưa cần

## RESPONSE FORMAT

error:

{
  success: false,
  message,
  error
}

## KIỂM TRA

- middleware tách file riêng
- không lặp code try/catch
- thứ tự middleware đúng trong app.js