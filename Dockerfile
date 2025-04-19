# Node.js application with frontend and backend

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy root package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy client package files to client directory
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci

# Return to app root
WORKDIR /app

# Copy all source files
COPY . .

# Build frontend and backend
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    TZ=UTC

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Copy necessary configuration files
COPY .env* ./
COPY start.sh ./

# Make start script executable
RUN chmod +x start.sh

# Expose port for the application
EXPOSE 5000

# Start the application using Node.js
CMD ["node", "dist/index.js"]
