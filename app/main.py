from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import time
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge

from app.api.routes import users, listings
# Import additional route modules as they're created: bookings, reviews, messages

from app.core.config import settings
from app.db.database import get_db

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Prometheus metrics
request_counter = Counter(
    'http_requests_total', 'Total number of requests', ['method', 'endpoint', 'status']
)
request_duration = Histogram(
    'http_request_duration_seconds', 'Request duration in seconds', ['method', 'endpoint']
)
active_requests = Gauge(
    'http_requests_active', 'Number of active requests', ['method', 'endpoint']
)

# Define metrics middleware
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    # Start timer and increment active requests
    start_time = time.time()
    method = request.method
    endpoint = request.url.path
    active_requests.labels(method=method, endpoint=endpoint).inc()
    
    # Process request
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        status_code = 500
        raise e
    finally:
        # Record metrics
        request_duration.labels(method=method, endpoint=endpoint).observe(time.time() - start_time)
        request_counter.labels(method=method, endpoint=endpoint, status=status_code).inc()
        active_requests.labels(method=method, endpoint=endpoint).dec()
    
    return response

# Health check endpoint
@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {"status": "healthy"}

# Root endpoint
@app.get("/api", tags=["root"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.API_VERSION,
        "description": settings.DESCRIPTION,
    }

# Metrics endpoint
@app.get("/metrics", include_in_schema=False)
def metrics():
    return prometheus_client.generate_latest()

# Include API routers
app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
# Add additional routers as they're created

# Serve static files if available
try:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
except:
    # If no static files directory exists, just continue without it
    pass

# Run application if executed directly
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)