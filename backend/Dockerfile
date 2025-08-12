# Sử dụng base image chính thức của Python
FROM python:3.10-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file cần thiết vào thư mục /app
# File requirements.txt nên được copy riêng để tận dụng Docker cache
# Đường dẫn đã được điều chỉnh để phù hợp với cấu trúc file mới
COPY requirements.txt /app/

# Cài đặt các thư viện cần thiết
# Sử dụng --no-cache-dir để giảm dung lượng image
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code của bạn vào thư mục /app
COPY . /app

# Định nghĩa lệnh mặc định để chạy ứng dụng
# uvicorn sẽ tự đọc biến môi trường khi container chạy
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
