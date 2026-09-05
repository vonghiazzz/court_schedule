# Hệ Thống Lịch Đăng Ký Phiên Xét Xử (Court Schedule)

Ứng dụng web quản lý lịch xét xử dành cho thẩm phán, được xây dựng trên nền tảng **FastAPI (Python)** cho Backend và **React (JavaScript)** cho Frontend, sử dụng **PostgreSQL** làm cơ sở dữ liệu.

---

## 📌 Các bước chuẩn bị trước khi chạy (Prerequisites)
Bạn có hai tùy chọn để cấu hình Cơ sở dữ liệu (Database):

### Tùy chọn A: Sử dụng Database Local (Docker Postgres - Khuyên dùng khi code)
Nếu muốn chạy cơ sở dữ liệu local trên máy tính cá nhân mà không phụ thuộc vào Internet:
1. Khởi chạy container Database PostgreSQL độc lập thông qua Docker Compose:
   ```bash
   docker-compose up db -d
   ```
   *(Database sẽ khởi chạy ở cổng `5434` trên máy local).*
2. Cấu hình tệp `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5434/court_db
   ```

### Tùy chọn B: Kết nối Database Cloud (Render / Supabase)
Nếu kết nối trực tiếp vào cơ sở dữ liệu online:
1. Lấy **External Connection String (URI)** từ Supabase hoặc Render Dashboard (hoặc thông qua các công cụ như DBeaver).
   * **Lưu ý cực kỳ quan trọng cho Supabase:** Bạn nên sử dụng đường dẫn của **Transaction Pooler** hoặc **Session Pooler** (cổng `6543` thay vì cổng mặc định `5432`) để tránh lỗi phân giải tên miền (DNS) trên các mạng không hỗ trợ IPv6.
2. Cấu hình tệp `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxx.supabase.co:6543/postgres
   ```

---

## 🛠️ Quy trình chạy chế độ Phát triển (Local Dev với Nginx Proxy)
Đây là quy trình chuẩn hóa giúp kiểm thử ở local thông qua **Nginx** giống hệt 100% môi trường Production:
* Backend chạy Hot-Reload local trên máy Mac (cổng `8001`).
* Frontend chạy Hot-Reload local trên máy Mac (cổng `3000`).
* Một container Nginx chạy cổng `8080` đóng vai trò proxy điều phối chung.

### Bước 1: Khởi động Database (Nếu chọn Tùy chọn A ở trên)
```bash
docker-compose up db -d
```

### Bước 2: Chạy Backend (FastAPI)
1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Tạo và kích hoạt môi trường ảo:
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   * **Windows:**
     ```cmd
     python -m venv venv
     venv\Scripts\activate
     ```
3. Cài đặt các gói thư viện:
   ```bash
   pip install -r requirements.txt
   ```
4. Khởi chạy Uvicorn server ở cổng **8001**:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```
   * Trang tài liệu API local sẽ khả dụng tại: [http://localhost:8001/docs](http://localhost:8001/docs)

### Bước 3: Chạy Frontend (React)
1. Mở một cửa sổ terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói npm 
   ```bash
   npm install
   ```
3. Khởi chạy dự án React:
   ```bash
   npm start
   ```
   *(Trình duyệt sẽ tự động mở trang `http://localhost:3000`, tuy nhiên ta sẽ truy cập thông qua cổng Nginx ở bước dưới).*

### Bước 4: Khởi chạy Nginx Local Proxy Container
1. Mở terminal tại thư mục gốc của dự án và chạy:
   ```bash
   docker-compose up nginx-local -d
   ```
   *(Nginx sẽ khởi động ở cổng `8080` của máy local và tự động định tuyến `/api` về backend cổng `8001`, định tuyến `/` về frontend cổng `3000` thông qua `host.docker.internal`).*
2. **Truy cập ứng dụng:** Mở trình duyệt tại địa chỉ **`http://localhost:8080`** để bắt đầu sử dụng và kiểm thử (Hot-Reload của React vẫn hoạt động bình thường).

> [!TIP]
> **Tóm tắt quy trình dev hàng ngày của bạn:**
> 1. Mở Terminal 1: Chạy Backend local (`uvicorn app.main:app --reload --port 8001`).
> 2. Mở Terminal 2: Chạy Frontend local (`npm start`).
> 3. Mở Terminal 3: Bật Nginx local lên: `docker-compose up nginx-local -d`.
> 4. Mở trình duyệt: Truy cập `http://localhost:8080` để sử dụng ứng dụng. Sửa code ở cả Frontend hay Backend thì trang web đều tự nhận và cập nhật ngay lập tức!

---

## 🚀 Quy trình chạy chế độ Đóng gói / Sản xuất (Production - Docker Compose)
Dùng khi bạn muốn deploy sản phẩm thực tế, chạy toàn bộ ứng dụng thông qua **Nginx** điều phối mà không cần cài đặt Python/Node.js trên máy chủ.

### ⚠️ Lưu ý cực kỳ quan trọng về mạng của Docker (Docker Network Hostname):
Khi chạy Backend **bên trong Container** (thông qua `docker-compose`), Backend không thể dùng tên host là `localhost:5434` để kết nối vào Database local được nữa. Nó phải gọi tới tên dịch vụ của DB trong Docker Network là `db:5432`.

Do đó, hãy cấu hình file `backend/.env` như sau trước khi chạy Docker Compose:
* **Nếu dùng DB Docker:**
  ```env
  DATABASE_URL=postgresql://postgres:postgres@db:5432/court_db
  ```
* **Nếu dùng DB Render:** Giữ nguyên đường dẫn URL của Render.

### Các bước khởi chạy:
1. Đứng tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`):
   ```bash
   docker-compose up --build -d
   ```
2. Sau khi tất cả các container chuyển sang trạng thái xanh:
   * **Truy cập ứng dụng qua cổng Nginx:** `http://localhost:8080` (Nginx tự phân phối URL `/api` cho backend và `/` cho frontend).
3. Khi cần dừng toàn bộ hệ thống:
   ```bash
   docker-compose down
   ```
