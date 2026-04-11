# SKILL: CONTROLLER

## MỤC TIÊU

Chuẩn hóa controller layer.

## PHẠM VI

- nhận request
- gọi service
- trả response

Không bao gồm:
- business logic phức tạp

## QUY TẮC

controller phải:

- đọc req
- gọi service
- return response

controller không được:

- xử lý logic dài
- viết query DB trực tiếp nếu có service

## RESPONSE

success:

{
  success: true,
  message,
  data
}

error:

forward middleware

## STRUCTURE

- mỗi function = 1 endpoint

## KIỂM TRA

- không logic phức tạp
- không trùng code
- response đúng format