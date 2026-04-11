# SKILL: UTILS

## MỤC TIÊU

Chuẩn hóa utils dùng chung.

## PHẠM VI

- asyncHandler
- response helper nếu cần

## QUY TẮC

utils phải:

- tái sử dụng được
- độc lập với business logic

utils không được:

- chứa logic nghiệp vụ
- phụ thuộc controller/service

## KHÔNG ĐƯỢC

- tạo utils vô nghĩa
- tạo file chung chung không rõ mục đích

## KIỂM TRA

- utils có được dùng ở nhiều nơi không
- có thực sự cần không