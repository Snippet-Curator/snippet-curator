# === Builder stage ===
FROM node:alpine AS builder
WORKDIR /app

# Setting PB URL environment
ENV VITE_PB_URL=http://macmini:8090

# Copy package.json and install
COPY ./svelte-app/package.json ./
RUN npm install

# Get Pocketbase
ARG PB_VERSION=0.28.4
RUN apk add --no-cache \
    unzip \
    ca-certificates
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip

# Copy rest of the app
COPY ./svelte-app ./
# Add Pocketbase environment
RUN echo "VITE_PB_URL=$VITE_PB_URL" > .env
# Add pocketbase exec
RUN unzip /tmp/pb.zip -d ./db
# Copy migration and hooks files
COPY ./electron-app/db/pb_migrations ./db/pb_migrations
COPY ./electron-app/db/pb_hooks ./db/pb_hooks

# Build the app
RUN npm run build

# === Runner stage ===
FROM node:alpine AS runner
WORKDIR /app

# Install minimal static server
RUN npm install -g serve

# Copy built output from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/db/pb_migrations ./db/pb_migrations
COPY --from=builder /app/db/pb_hooks ./db/pb_hooks
COPY --from=builder /app/db/pocketbase ./db/pocketbase
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env ./

# Startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose app port
EXPOSE 5173
EXPOSE 8090

CMD ["/start.sh"]