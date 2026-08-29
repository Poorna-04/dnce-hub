# Stage 1 — install + build (standalone output lands in .next/standalone)
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# next.config COPY of /app/public fails if this folder is absent
RUN mkdir -p public

# NEXT_PUBLIC_* is inlined at build time. SPRING_BASE_URL is also read by
# next.config.ts rewrites during `next build`, so pass the Docker-network
# (or Cloud Run) backend URL as a build-arg. Runtime SPRING_BASE_URL still
# controls serverFetch / Route Handlers.
ARG NEXT_PUBLIC_API_BASE_URL=/api/v1
ARG SPRING_BASE_URL=http://backend:8080/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV SPRING_BASE_URL=$SPRING_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2 — run the traced standalone server only (no npm, no source)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SPRING_BASE_URL=http://backend:8080/api/v1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
