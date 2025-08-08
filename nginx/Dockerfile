FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY ../nginx/default.conf /etc/nginx/conf.d/default.conf
