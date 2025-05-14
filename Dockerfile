# === Builder stage ===
FROM alpine as builder
WORKDIR /app
COPY ./svelte-app/package.json package-lock.json ./
RUN npm ci

# Copy rest of the app
COPY ./svelte-app . 
COPY ./electron-app/db/pb_migrations ./db/pb_migrations
COPY ./electron-app/db/pb_hooks ./db/pb_hooks

# Build the app
RUN npm run build

# === Runner stage ===
FROM alpine AS runner
WORKDIR /app

# Install minimal static server
RUN npm install -g serve

# Copy built output from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/db/pb_migrations ./db/db_migrations
COPY --from=builder /app/db/pb_hooks ./db/db_hooks
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose app port
EXPOSE 3795

CMD ["serve", "build", "-l", "3795"]