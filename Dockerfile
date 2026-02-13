# Multi-stage build: build static assets with Node, serve via Nginx

FROM node:20-alpine AS build
WORKDIR /app

# Install deps (prefer npm ci if lockfile exists)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Copy sources and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default config and add SPA-friendly config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist .

# Expose HTTP port
EXPOSE 80

# Default nginx start
CMD ["nginx", "-g", "daemon off;"]
