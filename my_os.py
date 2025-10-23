"""ASGI entrypoint for running the local AgentOS with uvicorn as `my_os:app`.

This module imports `News.setup_agno_os_safe.build_os()` and exposes `app`.
"""

from News.setup_agno_os_safe import build_os

agnos, app = build_os()

# Optionally provide the AgentOS instance too
os_instance = agnos
