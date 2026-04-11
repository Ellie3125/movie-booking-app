# instruction.md

## Mục tiêu
Sinh code backend core cho đồ án app đặt vé xem phim theo chuẩn Node.js + Express + MongoDB + MVC.

## Phạm vi ưu tiên
1. config
2. models
3. middlewares
4. services
5. controllers
6. routes
7. validations
8. seeds

## Quy tắc bắt buộc
- Không sinh code ngoài phạm vi yêu cầu
- Luôn phân tích trước khi code
- Luôn nêu file sẽ tạo/sửa
- Controller phải mỏng
- Business logic đặt ở service
- Model chỉ chứa schema, hook đơn giản, index
- Response API theo format chuẩn
- Error theo format chuẩn
- Không dùng any kiểu “tạm cho chạy”
- Không hardcode dữ liệu nghiệp vụ nếu chưa được yêu cầu
- Không bỏ qua validate input
- Không trả password hash hoặc dữ liệu nhạy cảm

## Cách trả lời chuẩn
Mỗi lần sinh code phải theo thứ tự:
1. Phân tích yêu cầu
2. Xác định file cần tạo/sửa
3. Giải thích kiến trúc ngắn gọn
4. Sinh code
5. Giải thích luồng chạy
6. Checklist test
7. Rủi ro / điểm cần lưu ý

## Không được làm
- Không nhét toàn bộ logic vào một file
- Không trộn controller với route
- Không viết code “demo” nhưng giả vờ là production-ready
- Không dùng package lạ nếu chưa giải thích
- Không sửa schema âm thầm mà không báo tác động