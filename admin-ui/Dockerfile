FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Bước 2: Dùng nginx để chạy app
FROM nginx:alpine
COPY --from=builder /app/dist/tedu-blog-admin-ui /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf