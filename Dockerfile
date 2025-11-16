# ============================================================================
# Multi-stage Dockerfile for On Tour App 2.0 Production
# Optimized for WebAssembly, Node.js, and PWA deployment
# ============================================================================

# Stage 1: Rust/WASM Builder
FROM rust:1.75-slim as wasm-builder

# Install wasm-pack and required tools
RUN apt-get update && apt-get install -y \
    pkg-config \
    curl \
    && curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh \
    && rm -rf /var/lib/apt/lists/*

# Copy WASM source code
WORKDIR /app/wasm-financial-engine
COPY wasm-financial-engine/Cargo.toml wasm-financial-engine/Cargo.lock ./
COPY wasm-financial-engine/src ./src/

# Build WebAssembly module
RUN wasm-pack build --target web --out-dir pkg --release

# Stage 2: Node.js Builder
FROM node:20-alpine as node-builder

# Install production dependencies for building
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with cache optimization
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy source code
COPY . .

# Copy WASM artifacts from previous stage
COPY --from=wasm-builder /app/wasm-financial-engine/pkg ./wasm-financial-engine/pkg/

# Build application
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV VITE_APP_VERSION=docker-build

RUN npm run build

# Stage 3: Production Runtime (Nginx)
FROM nginx:1.25-alpine as production

# Install security updates
RUN apk upgrade --no-cache

# Copy built application
COPY --from=node-builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Add metadata
LABEL maintainer="On Tour App Team"
LABEL version="2.2.1"
LABEL description="On Tour App 2.0 - Multi-tenant Tour Management Platform"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================================================
# Development Dockerfile (optional alternative)
# ============================================================================

FROM node:20-alpine as development

# Install Rust for WASM development
RUN apk add --no-cache curl build-base
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup target add wasm32-unknown-unknown
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]