# syntax=docker/dockerfile:1

# --- Build the Angular static site ---
FROM node:22 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Serve static files + reverse-proxy the APIs via Caddy ---
FROM caddy:2 AS final
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/devHub-app/browser /srv
