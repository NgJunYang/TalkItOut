FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY packages/lib/package.json ./packages/lib/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm install --workspaces

# Copy source code
COPY packages/lib ./packages/lib
COPY apps/api ./apps/api

# Build
RUN npm run build --workspace=@talkitout/api

# Expose port
EXPOSE 4000

# Start server
CMD ["npm", "run", "start", "--workspace=@talkitout/api"]
