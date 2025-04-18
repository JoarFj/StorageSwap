# Multi-stage build for Python FastAPI backend and React frontend

# Stage 1: Frontend build
FROM node:18-alpine AS frontend-build
WORKDIR /app

# Copy package.json and install dependencies
#COPY client/package*.json ./

RUN npm install


# Copy the rest of the frontend code
COPY client/ ./

# Build the frontend
RUN npm run build

# Stage 2: Backend build
FROM python:3.11-slim AS backend

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=UTC \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir . gunicorn

# Copy backend code
COPY app/ ./app/
COPY migrations/ ./migrations/
COPY alembic.ini .
COPY start.sh .
COPY prometheus.yml .

# Copy built frontend from stage 1
COPY --from=frontend-build /app/dist ./static

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 5000

# Set entrypoint to startup script
ENTRYPOINT ["./start.sh"]
