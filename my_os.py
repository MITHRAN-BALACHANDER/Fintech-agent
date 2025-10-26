"""
Fintech Agent Platform - ASGI entrypoint
Run with: uvicorn my_os:app --host 0.0.0.0 --port 7777 --reload
"""
import os
from pathlib import Path

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    load_dotenv(dotenv_path=env_path)
    print(f"✓ Loaded environment variables from {env_path}")
    print(f"✓ GOOGLE_API_KEY is {'set' if os.getenv('GOOGLE_API_KEY') else 'NOT set'}")
except ImportError:
    print("⚠ python-dotenv not installed. Install with: pip install python-dotenv")
except Exception as e:
    print(f"⚠ Error loading .env file: {e}")

from fintech_platform.fintech_os import app, platform

# Export app for uvicorn
# Also export platform instance for direct access
os_instance = platform
