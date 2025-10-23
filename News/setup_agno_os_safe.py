from agno.os.app import AgentOS

# Import the safe agent (import-safe demo)
from .newsagent_safe import agent


def build_os():
    """Construct a minimal AgentOS containing the news agent and return the FastAPI app."""
    agnos = AgentOS(name="Fintech News OS", agents=[agent], settings=None)
    app = agnos.get_app()
    return agnos, app


if __name__ == "__main__":
    agnos, app = build_os()

    # Print routes as a smoke-test
    print("Routes registered in AgentOS:")
    for route in app.routes:
        print(route.path)

    # To serve the app locally uncomment the following line
    # agnos.serve(app, host="0.0.0.0", port=7777, reload=False)
