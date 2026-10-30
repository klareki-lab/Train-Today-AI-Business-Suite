FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_BASE_URL=/api
ARG VITE_CRM_ORIGIN=http://localhost:3080
ENV VITE_CRM_ORIGIN=$VITE_CRM_ORIGIN
RUN npm run build
FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY deploy/local/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
