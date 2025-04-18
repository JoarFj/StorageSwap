"""
Entry point for running the FastAPI application.
This script is used to start the server from the command line.
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)