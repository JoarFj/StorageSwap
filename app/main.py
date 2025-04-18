from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import time
from prometheus_client import Counter, Histogram, make_asgi_app

from app.api.routes import users, listings, bookings, reviews, messages
from app.core.config import settings

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.API_VERSION,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
if settings.METRICS_ENABLED:
    # Create metrics
    REQUEST_COUNT = Counter(
        "api_requests_total", 
        "Total count of API requests", 
        ["method", "endpoint", "status_code"]
    )
    REQUEST_LATENCY = Histogram(
        "api_request_latency_seconds",
        "API request latency in seconds",
        ["method", "endpoint"]
    )
    
    # Add Prometheus middleware
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)
    
    # Add middleware to track request metrics
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        start_time = time.time()
        
        # Process the request
        response = await call_next(request)
        
        # Record metrics
        endpoint = request.url.path
        method = request.method
        status_code = response.status_code
        
        # Skip metrics endpoint itself
        if endpoint != "/metrics":
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(time.time() - start_time)
        
        return response

# Include API routers
app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(messages.router, prefix="/api")

# Mount static files (if needed)
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    pass

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {"status": "healthy", "version": settings.API_VERSION}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.API_VERSION,
        "description": settings.DESCRIPTION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)