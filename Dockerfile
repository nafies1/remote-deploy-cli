# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files to install dependencies
COPY package.json ./

# Install only production dependencies for smaller image size
# First try with package-lock.json, fallback to npm install if not available
RUN if [ -f package-lock.json ]; then \
  npm ci --only=production; \
  else \
  npm install --only=production; \
  fi && \
  npm cache clean --force

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Install required packages
RUN apk add --no-cache \
  bash \
  git \
  docker-cli \
  docker-cli-compose \
  dumb-init && \
  # Clean up apk cache to save space
  rm -rf /var/cache/apk/*

# Verify required tools has been installed (Build-time check)
RUN bash --version && \
    docker --version && \
    docker compose version

# Set environment to production
ENV NODE_ENV=production

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy only essential application files (avoid copying everything)
COPY package.json ./
COPY bin/ ./bin/
COPY lib/ ./lib/

# Make the CLI executable
RUN chmod +x bin/index.js && \
  # Remove development files that might have been copied
  find . -name "*.md" -delete && \
  find . -name "*.test.js" -delete && \
  find . -name "test" -type d -exec rm -rf {} + 2>/dev/null || true

# Expose the port the server listens on
EXPOSE 3000

# Health check to ensure the server is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${SERVER_PORT:-3000}/health || exit 1

# Use dumb-init as the entrypoint to handle signals
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Default command to start the server
CMD ["node", "bin/index.js", "listen"]