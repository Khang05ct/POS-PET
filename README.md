# 🐾 PetCare POS - Hệ thống quản lý bán hàng cho cửa hàng thú cưng

> Hệ thống POS (Point of Sale) chuyên dụng cho cửa hàng thú cưng, được xây dựng bằng **React 19 + Vite** (Frontend) và **Node.js + Express 5 + MySQL** (Backend), kết hợp **Socket.IO** cho cập nhật realtime.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📌 Mục lục

1. [Tính năng](#-tính-năng)
2. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
3. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
4. [Hướng dẫn cài đặt từ A-Z](#-hướng-dẫn-cài-đặt-từ-a-z)
5. [Tài khoản đăng nhập](#-tài-khoản-đăng-nhập)
6. [Danh sách API](#-danh-sách-api)
7. [Tech Stack](#-tech-stack)
8. [Hướng dẫn phát triển tiếp](#-hướng-dẫn-phát-triển-tiếp)
9. [Xử lý lỗi thường gặp](#-xử-lý-lỗi-thường-gặp)

---

## ✨ Tính năng

### Đã hoàn thành ✅
| Module | Mô tả |
|--------|--------|
| 🔐 **Đăng nhập** | Trang login cao cấp 2 cột, ảnh pet shop + form đăng nhập |
| 📊 **Dashboard** | KPI cards, biểu đồ doanh thu (Recharts), cảnh báo hàng tồn kho thấp, đơn hàng gần nhất, realtime Socket.IO |
| 🛒 **POS Bán hàng** | Tìm sản phẩm/barcode, giỏ hàng, chọn khách hàng, giảm giá, thanh toán (Tiền mặt/QR/Chuyển khoản), in hóa đơn |
| 📦 **Sản phẩm** | CRUD sản phẩm, upload ảnh, filter danh mục/trạng thái/tồn kho |
| 📁 **Danh mục** | CRUD danh mục sản phẩm |
| 🏪 **Kho hàng** | Phiếu nhập kho, theo dõi biến động tồn kho, cảnh báo sản phẩm sắp hết |
| 👥 **Khách hàng** | CRUD khách hàng + quản lý thú cưng |
| 📋 **Đơn hàng** | Danh sách đơn + drawer chi tiết, filter theo trạng thái, search |
| 📊 **Báo cáo** | Biểu đồ doanh thu, top sản phẩm bán chạy, phương thức thanh toán |
| ⚙️ **Cài đặt** | Thông tin cửa hàng, ngân hàng QR, trạng thái hoạt động |
| 👤 **Nhân viên** | CRUD tài khoản nhân viên (ADMIN/STAFF) |

### Đang phát triển 🚧
| Module | Mô tả |
|--------|--------|
| ✂️ **Dịch vụ** | Quản lý dịch vụ chăm sóc thú cưng (grooming, spa...) |
| 📅 **Lịch hẹn** | Calendar view tuần/ngày, đặt lịch dịch vụ |
| 🎫 **Khuyến mãi** | Mã giảm giá, voucher, chương trình khuyến mãi |

---

## 💻 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:

| Phần mềm | Phiên bản tối thiểu | Link tải |
|-----------|---------------------|----------|
| **Node.js** | v18.0 trở lên (khuyến nghị v20+) | [nodejs.org](https://nodejs.org/) |
| **npm** | v9.0 trở lên (đi kèm Node.js) | Đi kèm Node.js |
| **MySQL** | 8.0 trở lên | [mysql.com](https://dev.mysql.com/downloads/) |
| **Git** | Bất kỳ | [git-scm.com](https://git-scm.com/) |

> 💡 **Mẹo:** Nếu bạn dùng XAMPP, WAMP hoặc Laragon thì MySQL đã có sẵn, không cần cài thêm. Khuyên dùng **Laragon** vì tích hợp sẵn MySQL + HeidiSQL rất tiện.

---

## 📂 Cấu trúc thư mục

```
POS-PETS/
├── backend/                    # Server API (Node.js + Express)
│   ├── database/
│   │   └── schema.sql          # ⭐ File tạo database + seed data
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Kết nối MySQL
│   │   ├── controllers/        # Xử lý logic nghiệp vụ
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── customerController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── petController.js
│   │   │   ├── productController.js
│   │   │   ├── reportController.js
│   │   │   ├── settingController.js
│   │   │   └── userController.js
│   │   ├── middleware/         # JWT auth, error handler
│   │   ├── routes/             # Định tuyến API
│   │   ├── sockets/            # Socket.IO handler (realtime)
│   │   ├── utils/              # JWT helper, upload...
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Entry point
│   ├── uploads/                # Ảnh sản phẩm upload
│   ├── .env                    # ⚠️ Biến môi trường (KHÔNG PUSH LÊN GIT)
│   ├── .env.example            # Mẫu file .env
│   └── package.json
│
├── frontend/                   # Giao diện (React 19 + Vite)
│   ├── src/
│   │   ├── api/                # Axios API client
│   │   │   ├── axiosClient.js  # Axios instance + JWT interceptor
│   │   │   ├── categoryApi.js
│   │   │   ├── customerApi.js
│   │   │   ├── inventoryApi.js
│   │   │   ├── orderApi.js
│   │   │   ├── productApi.js
│   │   │   ├── reportApi.js
│   │   │   ├── settingApi.js
│   │   │   └── userApi.js
│   │   ├── assets/             # Ảnh tĩnh (login-bg.jpg)
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Topbar, MainLayout
│   │   │   └── ui/             # StatCard, StatusBadge...
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Tất cả các trang
│   │   ├── utils/              # formatCurrency, formatDate
│   │   ├── App.jsx             # Router chính
│   │   ├── index.css           # Global CSS + Tailwind
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Biến môi trường frontend
│   ├── tailwind.config.js      # Cấu hình màu Tailwind
│   └── package.json
│
└── README.md                   # 📖 File này
```

---

## 🚀 Hướng dẫn cài đặt từ A-Z

### Bước 1: Clone dự án từ GitHub

```bash
git clone https://github.com/<tên-tài-khoản>/POS-PETS.git
cd POS-PETS
```

### Bước 2: Tạo Database MySQL

#### Cách 1: Dùng MySQL Workbench / HeidiSQL / phpMyAdmin
1. Mở phần mềm quản lý MySQL.
2. Mở file `backend/database/schema.sql`.
3. Bấm **Execute / Run** để chạy toàn bộ câu lệnh SQL.

#### Cách 2: Dùng Command Line
```bash
# Đăng nhập MySQL (nhập password nếu có)
mysql -u root -p

# Trong MySQL shell, chạy:
SOURCE C:/đường-dẫn-tới-project/POS-PETS/backend/database/schema.sql;

# Hoặc chạy trực tiếp 1 dòng:
mysql -u root -p < backend/database/schema.sql
```

> ✅ Sau bước này, database `petcare_pos_db` sẽ được tạo với 10 bảng + dữ liệu mẫu (danh mục, cài đặt cửa hàng).

### Bước 3: Cấu hình Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt packages
npm install
```

**Tạo file `.env`** (hoặc copy từ `.env.example`):

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

**Mở file `.env` và chỉnh sửa** cho đúng với máy bạn:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # ← Nhập mật khẩu MySQL của bạn (để trống nếu không có)
DB_NAME=petcare_pos_db
JWT_SECRET=your_jwt_secret_key_change_in_production
CLIENT_URL=http://localhost:5173
```

> ⚠️ **Quan trọng:** Nếu Frontend chạy ở cổng khác `5173` (ví dụ `5174`), phải đổi `CLIENT_URL` cho khớp, nếu không sẽ bị lỗi CORS.

### Bước 4: Khởi chạy Backend

```bash
# Vẫn đang ở thư mục backend/
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
Server is running on port 5000
Connected to MySQL database
```

> ❌ Nếu báo lỗi `Access denied` hoặc `ER_ACCESS_DENIED_ERROR` → kiểm tra lại `DB_USER` và `DB_PASSWORD` trong file `.env`.

### Bước 5: Tạo tài khoản Admin

Backend đang chạy, mở **một terminal MỚI** và chạy:

```bash
cd backend
node createAdmin.js
```

Hoặc nếu file `createAdmin.js` không tồn tại, dùng cURL / Postman:

```bash
# Dùng cURL (chạy trong PowerShell hoặc Terminal)
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"full_name\":\"Admin PetCare\",\"email\":\"admin@petcare.com\",\"phone\":\"0987654321\",\"password\":\"password123\",\"role\":\"ADMIN\"}"
```

Hoặc dùng **Postman**:
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Body (JSON):
```json
{
  "full_name": "Admin PetCare",
  "email": "admin@petcare.com",
  "phone": "0987654321",
  "password": "password123",
  "role": "ADMIN"
}
```

### Bước 6: Cấu hình Frontend

Mở **terminal mới** (giữ nguyên terminal Backend đang chạy):

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt packages
npm install
```

**Kiểm tra file `.env`** trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> Nếu file `.env` chưa có, tạo mới với nội dung trên.

### Bước 7: Khởi chạy Frontend

```bash
# Vẫn đang ở thư mục frontend/
npm run dev
```

Nếu thành công:
```
VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Bước 8: Truy cập và Đăng nhập

1. Mở trình duyệt, vào: **http://localhost:5173** (hoặc cổng hiển thị trên terminal)
2. Đăng nhập bằng tài khoản:
   - **Email:** `admin@petcare.com`
   - **Mật khẩu:** `password123`

---

## 🔑 Tài khoản đăng nhập

| Role | Email | Mật khẩu | Quyền |
|------|-------|-----------|-------|
| Admin | `admin@petcare.com` | `password123` | Toàn quyền: Dashboard, POS, Sản phẩm, Kho, Cài đặt, Nhân viên, Báo cáo |
| Staff | *(Tạo qua Admin)* | *(Tự đặt)* | Chỉ: POS Bán hàng, Đơn hàng, Khách hàng |

---

## 📡 Danh sách API

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký tài khoản |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/:id` | Chi tiết sản phẩm |
| POST | `/api/products` | Thêm sản phẩm *(Admin)* |
| PUT | `/api/products/:id` | Sửa sản phẩm *(Admin)* |
| DELETE | `/api/products/:id` | Xóa sản phẩm *(Admin)* |
| POST | `/api/products/:id/upload` | Upload ảnh sản phẩm |
| GET | `/api/products/barcode/:barcode` | Tìm SP theo barcode |

### Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Danh sách danh mục |
| POST | `/api/categories` | Thêm danh mục |
| PUT | `/api/categories/:id` | Sửa danh mục |
| DELETE | `/api/categories/:id` | Xóa danh mục |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders` | Danh sách đơn hàng |
| GET | `/api/orders/:id` | Chi tiết đơn hàng + items |
| POST | `/api/orders/checkout` | Tạo đơn + thanh toán (transaction) |
| POST | `/api/orders/temporary` | Tạo đơn tạm |
| PUT | `/api/orders/:id/cancel` | Hủy đơn hàng |

### Customers & Pets
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/POST/PUT/DELETE | `/api/customers` | CRUD khách hàng |
| GET/POST/PUT/DELETE | `/api/pets` | CRUD thú cưng |

### Inventory
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/inventory` | Tổng quan tồn kho |
| POST | `/api/inventory/import` | Phiếu nhập kho |
| GET | `/api/inventory/movements` | Lịch sử biến động |

### Reports
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/reports/dashboard` | KPI tổng quan |
| GET | `/api/reports/best-selling` | Top sản phẩm bán chạy |
| GET | `/api/reports/payment-methods` | Thống kê phương thức thanh toán |

### Settings & Users
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET/PUT | `/api/settings` | Cài đặt cửa hàng |
| PUT | `/api/settings/store-status` | Đổi trạng thái cửa hàng |
| GET/POST/PUT/DELETE | `/api/users` | CRUD nhân viên *(Admin)* |

---

## 🛠 Tech Stack

### Frontend
| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| React | 19.x | UI Framework |
| Vite | 8.x | Build tool & Dev server |
| Tailwind CSS | 4.x | Utility-first CSS |
| React Router DOM | 7.x | Routing (SPA) |
| Axios | 1.x | HTTP Client |
| Recharts | 3.x | Biểu đồ/Charts |
| Lucide React | 1.x | Icon library |
| Socket.IO Client | 4.x | Realtime |
| qrcode.react | 4.x | Tạo QR Code |
| react-to-print | 3.x | In hóa đơn |
| date-fns | 4.x | Format ngày tháng |

### Backend
| Thư viện | Phiên bản | Vai trò |
|----------|-----------|---------|
| Express | 5.x | Web framework |
| mysql2 | 3.x | MySQL driver |
| bcryptjs | 3.x | Hash password |
| jsonwebtoken | 9.x | JWT Authentication |
| Socket.IO | 4.x | Realtime server |
| multer | 2.x | Upload file |
| cors | 2.x | Cross-Origin config |
| dotenv | 17.x | Biến môi trường |
| nodemon | 3.x | Auto-restart dev |

---

## 🔧 Hướng dẫn phát triển tiếp

### Thêm trang mới (Frontend)

1. **Tạo file page** trong `frontend/src/pages/TenTrang.jsx`
2. **Thêm route** trong `frontend/src/App.jsx`:
   ```jsx
   import TenTrang from './pages/TenTrang';
   
   // Trong <Routes>:
   <Route path="ten-trang" element={<TenTrang />} />
   ```
3. **Thêm menu** trong `frontend/src/components/layout/Sidebar.jsx`:
   ```jsx
   // Thêm vào mảng navSections → items:
   { name: 'Tên Trang', path: '/ten-trang', icon: IconName, role: 'ADMIN' }
   ```

### Thêm API mới (Backend)

1. **Tạo Controller** trong `backend/src/controllers/tenController.js`
2. **Tạo Route** trong `backend/src/routes/tenRoutes.js`:
   ```javascript
   const express = require('express');
   const router = express.Router();
   const { protect, adminOnly } = require('../middleware/authMiddleware');
   const controller = require('../controllers/tenController');
   
   router.get('/', protect, controller.getAll);
   router.post('/', protect, adminOnly, controller.create);
   
   module.exports = router;
   ```
3. **Đăng ký route** trong `backend/src/app.js`:
   ```javascript
   const tenRoutes = require('./routes/tenRoutes');
   app.use('/api/ten', tenRoutes);
   ```
4. **Tạo API client** trong `frontend/src/api/tenApi.js`:
   ```javascript
   import axiosClient from './axiosClient';
   
   const tenApi = {
     getAll: () => axiosClient.get('/ten').then(res => res.data),
     create: (data) => axiosClient.post('/ten', data).then(res => res.data),
   };
   
   export default tenApi;
   ```

### Thêm bảng Database

1. Viết câu SQL `CREATE TABLE` mới
2. Chạy trong MySQL Workbench hoặc command line
3. **Khuyến nghị**: Thêm luôn vào file `backend/database/schema.sql` để đồng bộ cho team

### Component UI có sẵn

| Component | Import | Vai trò |
|-----------|--------|---------|
| `StatCard` | `components/ui/StatCard` | Thẻ KPI (doanh thu, đơn hàng...) |
| `StatusBadge` | `components/ui/StatusBadge` | Badge trạng thái (PAID, ACTIVE...) |

**Ví dụ dùng StatCard:**
```jsx
import StatCard from '../components/ui/StatCard';
import { DollarSign } from 'lucide-react';

<StatCard 
  title="Doanh thu" 
  value="12,500,000đ" 
  icon={DollarSign} 
  color="emerald"    // emerald | blue | amber | red | purple | cyan
  trend="up"         // up | down | null
  trendValue="+12%"
/>
```

### Bảng màu chính (Design System)

```
Primary:     #059669 (emerald-600) → Nút chính, active state
Primary Hover: #047857 (emerald-700)
Soft Green:  #ECFDF5 (emerald-50) → Nền nhạt
Border:      #E5E7EB → Viền card
Text Dark:   #0F172A → Tiêu đề
Text Muted:  #64748B → Mô tả phụ
Danger:      #EF4444 → Xóa, lỗi, hủy
Warning:     #F59E0B → Cảnh báo
Background:  #F8FAFB → Nền trang
```

---

## ❓ Xử lý lỗi thường gặp

### 1. Lỗi CORS
```
Access-Control-Allow-Origin header has a value 'http://localhost:5173' 
that is not equal to the supplied origin.
```
**Nguyên nhân:** Frontend chạy ở cổng khác với `CLIENT_URL` trong Backend.
**Cách sửa:** Mở `backend/.env`, đổi `CLIENT_URL` cho đúng cổng, rồi **restart backend** (`Ctrl+C` → `npm run dev`).

### 2. Lỗi kết nối MySQL
```
ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```
**Cách sửa:** Kiểm tra `DB_USER` và `DB_PASSWORD` trong `backend/.env`. Nếu MySQL có mật khẩu thì điền vào `DB_PASSWORD=matkhau`.

### 3. Lỗi "Cannot find module"
```
Error: Cannot find module '...'
```
**Cách sửa:** Chạy lại `npm install` trong thư mục bị lỗi (backend hoặc frontend).

### 4. Lỗi "Table doesn't exist"
**Cách sửa:** Chưa chạy file SQL. Mở `backend/database/schema.sql` và chạy trong MySQL.

### 5. Frontend trắng trang sau khi đăng nhập
**Cách sửa:** Kiểm tra Console (F12) xem có lỗi gì. Thường do Backend chưa chạy hoặc `VITE_API_URL` sai.

### 6. Không đăng nhập được
**Cách sửa:** Chưa tạo tài khoản Admin. Xem lại **Bước 5** ở trên.

---

## 📝 Lệnh tổng hợp (Cheat Sheet)

```bash
# === SETUP LẦN ĐẦU ===
git clone https://github.com/<username>/POS-PETS.git
cd POS-PETS

# 1. Database
mysql -u root -p < backend/database/schema.sql

# 2. Backend
cd backend
npm install
copy .env.example .env        # Rồi mở .env sửa DB_PASSWORD
npm run dev                    # Chạy ở terminal 1

# 3. Tạo Admin (terminal mới)
node createAdmin.js

# 4. Frontend (terminal mới)
cd ../frontend
npm install
npm run dev                    # Chạy ở terminal 2

# 5. Mở trình duyệt → http://localhost:5173
# Đăng nhập: admin@petcare.com / password123
```

```bash
# === CHẠY HÀNG NGÀY ===
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và thương mại.

---

<p align="center">
  Made with ❤️ by PetCare Team
</p>
