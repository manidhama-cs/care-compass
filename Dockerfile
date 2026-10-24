# CareCompass Production Multi-Stage Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build Vite frontend
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/consult_provider.py ./consult_provider.py
COPY --from=builder /app/predictions.csv ./predictions.csv
COPY --from=builder /app/.env.example ./.env

EXPOSE 3000

CMD ["tsx", "server.ts"]
