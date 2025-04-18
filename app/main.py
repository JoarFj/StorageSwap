from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import logging

from app.api.routes import users, listings, bookings, reviews, messages
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Storage Space API",
    description="API for P2P storage space marketplace",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(listings.router, prefix="/api", tags=["listings"])
app.include_router(bookings.router, prefix="/api", tags=["bookings"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(messages.router, prefix="/api", tags=["messages"])

# Serve static files (client-side app) in production
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

@app.get("/api/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        reload=True,
    )