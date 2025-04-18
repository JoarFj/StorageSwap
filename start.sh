#!/bin/bash
set -e

# Apply database migrations
echo "Running migrations..."
alembic upgrade head

# Start Uvicorn server for API
echo "Starting FastAPI application..."
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Running in production mode"
  gunicorn -k uvicorn.workers.UvicornWorker -b 0.0.0.0:5000 app.main:app --workers 4
else
  echo "Running in development mode"
  python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
fi