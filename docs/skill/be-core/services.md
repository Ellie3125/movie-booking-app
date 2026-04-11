# SKILL: SERVICE LAYER

## MỤC TIÊU

Chuẩn hóa service layer.

## PHẠM VI

- xử lý logic cơ bản
- gọi model

Không bao gồm:
- controller logic
- route logic

## QUY TẮC

service phải:

- xử lý logic
- thao tác DB
- trả dữ liệu cho controller

service không được:

- trả response trực tiếp
- dùng res
- dùng req

## KIỂM TRA

- logic nằm ở service
- controller chỉ gọi service
- không lặp code giữa service