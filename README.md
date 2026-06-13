# PetCare POS

Hệ thống quản lý bán hàng (Web POS) dành cho cửa hàng thú cưng.

## Tính năng nổi bật
- Quản lý kho và sản phẩm theo danh mục.
- Màn hình bán hàng POS chuẩn, dễ thao tác.
- In hóa đơn tạm tính và hóa đơn chính thức.
- Tự động trừ kho khi bán hàng với MySQL Transaction (đảm bảo tính toàn vẹn dữ liệu).
- Dashboard thống kê doanh thu, biểu đồ realtime.
- Cảnh báo tồn kho thấp qua Socket.IO.
- Hỗ trợ thanh toán tiền mặt, chuyển khoản, và tự động tạo mã QR thanh toán (VietQR).
- Phân quyền nhân viên và quản lý.

## Cài đặt và Khởi chạy

### 1. Cài đặt Cơ sở dữ liệu (MySQL)
1. Mở MySQL Workbench (hoặc PhpMyAdmin, DBeaver, Command Line).
2. Chạy nội dung trong file `backend/database/schema.sql` để tạo cơ sở dữ liệu `petcare_pos_db`, các bảng và seed data mặc định.

### 2. Cài đặt Backend
1. Mở Terminal / Command Prompt.
2. Di chuyển vào thư mục backend: `cd backend`
3. Cài đặt các gói phụ thuộc: `npm install`
4. Cấu hình môi trường:
   - Bạn sẽ thấy file `.env` đã được tạo sẵn (hoặc copy từ `.env.example`).
   - Sửa thông tin `DB_USER` và `DB_PASSWORD` cho đúng với cấu hình MySQL trên máy của bạn.
5. Chạy Backend Server: `npm run dev`
   - Server sẽ chạy tại: `http://localhost:5000`

### 3. Cài đặt Frontend
1. Mở một cửa sổ Terminal khác.
2. Di chuyển vào thư mục frontend: `cd frontend`
3. Cài đặt các gói phụ thuộc: `npm install`
4. Cấu hình môi trường:
   - File `.env` đã được tạo sẵn với `VITE_API_URL` là http://localhost:5000/api
5. Khởi chạy Frontend: `npm run dev`
   - Truy cập vào: `http://localhost:5173`

---

## Hướng dẫn sử dụng ban đầu

### 1. Tạo tài khoản Admin đầu tiên
- Mở Postman hoặc một công cụ tương tự.
- Gửi một **POST request** đến `http://localhost:5000/api/auth/register` với JSON body:
```json
{
  "full_name": "Admin PetCare",
  "email": "admin@petcare.vn",
  "phone": "0987654321",
  "password": "password123",
  "role": "ADMIN"
}
```
- Sau đó, đăng nhập bằng tài khoản `admin@petcare.vn` trên Frontend.

### 2. Thêm Danh mục & Sản phẩm
- Tại màn hình Dashboard, chọn mục **Danh mục** bên cột trái để thêm loại thức ăn hoặc phụ kiện.
- Chuyển sang mục **Sản phẩm**, nhấn nút **+ Thêm sản phẩm** (Cần gửi API qua Postman trong phiên bản demo quản lý CRUD này, hoặc tự hoàn thiện Form Frontend).
- *Lưu ý: API POST `/api/products` yêu cầu gửi kèm Bearer Token của Admin.*

### 3. Nhập kho và Bán hàng
- Sau khi có sản phẩm, bạn có thể thực hiện Import kho qua API `/api/inventory/import`.
- Truy cập menu **POS Bán hàng**, tìm kiếm sản phẩm bằng mã barcode, click để đưa vào giỏ.
- Chọn khách hàng (tuỳ chọn), nhập giảm giá.
- Bấm **Thanh toán**, chọn tiền mặt hoặc Quét QR.
- Sau khi thanh toán thành công, hệ thống tự động tải lại màn hình Dashboard qua Socket.IO.
