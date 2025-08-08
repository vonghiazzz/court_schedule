# Dockerfile của Frontend

# Giai đoạn build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn serve với Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# Sao chép file cấu hình Nginx của bạn vào container
COPY ./nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]