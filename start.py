"""
FinSIght Platform - Startup Script
Initialize database and start the platform
"""
import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from core.database import init_database
from agno.utils.log import logger


def main():
    """Initialize and start the platform"""
    logger.info("=" * 60)
    logger.info("FinSIght Platform - Starting Up")
    logger.info("=" * 60)
    
    # Initialize database
    logger.info("Initializing database...")
    engine = init_database()
    logger.info(f"Database initialized: {engine.url}")
    
    logger.info("=" * 60)
    logger.info("Platform ready!")
    logger.info("Starting server on http://0.0.0.0:7777")
    logger.info("API Documentation: http://localhost:7777/docs")
    logger.info("=" * 60)
    
    # Start uvicorn
    import uvicorn
    uvicorn.run(
        "my_os:app",
        host="0.0.0.0",
        port=7777,
        reload=True,
        log_level="info"
    )


if __name__ == "__main__":
    main()
