# ============================================================
# opendoll-backend Docker image
# Multi-stage build for optimized image size
# ============================================================

# ============ Dependencies stage ============
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

# better-sqlite3 requires native module compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# ============ Runtime stage ============
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# better-sqlite3 needs libstdc++ at runtime
RUN apk add --no-cache libstdc++ curl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY cmd ./cmd
COPY svc ./svc
COPY mod ./mod
COPY lib ./lib
COPY shared ./shared
COPY public ./public

RUN mkdir -p /app/data/images && chown -R appuser:nodejs /app/data

USER appuser

EXPOSE 3001
ENV PORT=3001

CMD ["npx", "tsx", "cmd/main/main.ts"]
