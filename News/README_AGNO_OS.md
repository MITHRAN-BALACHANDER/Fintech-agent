# AGNO OS - Local Setup (News Agent)

This folder contains a small helper to build and smoke-test an AgentOS instance using the existing `newsagent`.

Prerequisites
- Python 3.11+ (your venv shows packages installed)
- The project's virtual environment activated (e.g. `.venv`) and dependencies installed. The `agno` package must be installed in the environment.
- Environment variables required by `agno` models (OpenAI, Gemini, etc.) set in `.env` or environment.

Quick smoke test
1. Activate your venv (PowerShell):

```powershell
. .\.venv\Scripts\Activate.ps1
```

2. Run the setup script to print registered routes:

```powershell
python -m News.setup_agno_os
```

This will import `News.newsagent.agent`, construct an `AgentOS`, and list the FastAPI routes the OS exposes.

Serve the OS
- To run the OS locally, open `News/setup_agno_os.py` and uncomment the `agnos.serve(...)` call at the bottom. Then run the script again.

Notes
- The helper does not start the server by default to avoid side-effects on import.
- If you need a dockerized AgentOS or additional interfaces (A2A, MCP servers), we can add a Dockerfile and a more complete run script.
