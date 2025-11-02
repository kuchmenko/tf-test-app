FROM oven/bun:1 AS base

WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY packages/db/package.json ./packages/db/
RUN bun install --frozen-lockfile

# Build (optional - can skip and run src directly)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY apps/api ./apps/api
COPY packages/db ./packages/db

WORKDIR /app/apps/api
RUN bun build src/index.ts --outdir=dist --target=bun --minify

# Production
FROM base AS production

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/packages/db ./packages/db
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3001

# Run bundled file
CMD ["bun", "dist/index.js"]
