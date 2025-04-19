# Node.js application with frontend and backend

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

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

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]