FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Cài chuẩn production dependencies dựa theo package-lock.json
RUN npm ci --omit=dev

# Stage 2: Production Runtime Image
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules đã build và source code với quyền user node
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . . 

# Chuyển sang user node (non-root) để bảo mật
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/', (res) => { process.exit(res.statusCode < 500 ? 0 : 1); }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
