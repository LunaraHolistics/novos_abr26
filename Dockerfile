@"
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Cria um .env temporário só para o Vite não reclamar durante o build
RUN echo "GEMINI_API_KEY=dummy_key_for_build" > .env
RUN npm run build

FROM nginx:alpine
# Instala o pacote que contém o envsubst
RUN apk add --no-cache gettext
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["/bin/sh", "-c", "envsubst '`${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
"@ | Set-Content -Path "Dockerfile" -Encoding UTF8