FROM node:20-alpine

# Build tools required by better-sqlite3 (node-gyp)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install all dependencies using npm — reliably runs postinstall scripts
# (including better-sqlite3's node-gyp native compilation)
COPY package.json ./
RUN npm install

# Copy full source and build frontend
COPY . .
RUN npm run build

# Remove dev-only packages after build to keep the image leaner
RUN npm prune --production

# Ensure data directory exists for SQLite
RUN mkdir -p data

ENV NODE_ENV=production
ENV DB_PATH=/app/data/jobsearch.db

# PORT is injected at runtime via docker-compose (defaults to 3031)
ARG PORT=3031
EXPOSE ${PORT}

CMD ["node", "server/index.js"]
