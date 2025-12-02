"""
Example usage of the FinSIght Platform
Demonstrates creating users, adding rules, and querying agents
"""
import requests
import json
from typing import Dict, Any

# Platform URL
BASE_URL = "http://localhost:7777"


def create_user(email: str, name: str, risk_profile: str = "moderate") -> Dict[str, Any]:
    """Create a new user and their personal agent"""
    response = requests.post(
        f"{BASE_URL}/api/users",
        json={
            "email": email,
            "name": name,
            "risk_profile": risk_profile,
            "preferred_channels": ["email"]
        }
    )
    return response.json()


def add_watchlist(user_id: str, name: str, assets: list, asset_type: str) -> Dict[str, Any]:
    """Add a watchlist for a user"""
    response = requests.post(
        f"{BASE_URL}/api/users/{user_id}/watchlists",
        json={
            "name": name,
            "assets": assets,
            "asset_type": asset_type
        }
    )
    return response.json()


def add_rule(user_id: str, rule_config: Dict[str, Any]) -> Dict[str, Any]:
    """Add a trading rule for a user"""
    response = requests.post(
        f"{BASE_URL}/api/users/{user_id}/rules",
        json=rule_config
    )
    return response.json()


def query_agent(user_id: str, message: str) -> Dict[str, Any]:
    """Query a user's personal agent"""
    response = requests.post(
        f"{BASE_URL}/api/users/{user_id}/query",
        json={
            "message": message,
            "stream": False
        }
    )
    return response.json()


def evaluate_rules(user_id: str = None) -> Dict[str, Any]:
    """Manually trigger rule evaluation"""
    params = {"user_id": user_id} if user_id else {}
    response = requests.post(f"{BASE_URL}/api/rules/evaluate", params=params)
    return response.json()


def start_monitoring(interval: int = 60) -> Dict[str, Any]:
    """Start background rule monitoring"""
    response = requests.post(
        f"{BASE_URL}/api/monitoring/start",
        params={"interval": interval}
    )
    return response.json()


def get_stats() -> Dict[str, Any]:
    """Get platform statistics"""
    response = requests.get(f"{BASE_URL}/api/stats")
    return response.json()


# Example 1: Create a user interested in Indian stocks
def example_indian_stocks():
    print("=== Example 1: Indian Stock Trader ===\n")
    
    # Create user
    user = create_user("rajesh@example.com", "Rajesh Kumar", "moderate")
    user_id = user["user"]["id"]
    print(f"Created user: {user['user']['name']} (ID: {user_id})")
    
    # Add watchlist
    watchlist = add_watchlist(
        user_id,
        "My Indian Stocks",
        ["TCS.NS", "INFY.NS", "RELIANCE.NS", "HDFCBANK.NS"],
        "stock"
    )
    print(f"Added watchlist: {watchlist['watchlist']['name']}")
    
    # Add price alert rule for TCS
    rule = add_rule(user_id, {
        "name": "TCS Price Alert",
        "description": "Alert me when TCS goes above ₹4000",
        "asset": "TCS.NS",
        "asset_type": "stock",
        "rule_type": "price_above",
        "condition": {"threshold": 4000},
        "actions": ["notify_email"],
        "priority": 1
    })
    print(f"Added rule: {rule['rule']['name']}")
    
    # Query agent
    response = query_agent(user_id, "What's the current price of TCS and should I buy?")
    print(f"\nAgent response:\n{response['response']}\n")
    
    return user_id


# Example 2: Create a crypto trader
def example_crypto_trader():
    print("=== Example 2: Cryptocurrency Trader ===\n")
    
    # Create user
    user = create_user("sarah@example.com", "Sarah Chen", "aggressive")
    user_id = user["user"]["id"]
    print(f"Created user: {user['user']['name']} (ID: {user_id})")
    
    # Add crypto watchlist
    watchlist = add_watchlist(
        user_id,
        "Crypto Portfolio",
        ["BTC-USD", "ETH-USD", "SOL-USD"],
        "crypto"
    )
    print(f"Added watchlist: {watchlist['watchlist']['name']}")
    
    # Add momentum rule for Bitcoin
    rule = add_rule(user_id, {
        "name": "Bitcoin Buy Signal",
        "description": "Buy when BTC has positive momentum despite low price",
        "asset": "BTC-USD",
        "asset_type": "crypto",
        "rule_type": "momentum_positive",
        "condition": {"threshold": 5.0},
        "actions": ["notify_email", "buy_trigger"],
        "priority": 1
    })
    print(f"Added rule: {rule['rule']['name']}")
    
    # Query agent
    response = query_agent(
        user_id,
        "Analyze Bitcoin and Ethereum. Which one has better momentum right now?"
    )
    print(f"\nAgent response:\n{response['response']}\n")
    
    return user_id


# Example 3: Create a US stock trader
def example_us_stocks():
    print("=== Example 3: US Stock Trader ===\n")
    
    # Create user
    user = create_user("mike@example.com", "Mike Johnson", "conservative")
    user_id = user["user"]["id"]
    print(f"Created user: {user['user']['name']} (ID: {user_id})")
    
    # Add watchlist
    watchlist = add_watchlist(
        user_id,
        "Tech Giants",
        ["MSFT", "GOOGL", "AAPL", "AMZN"],
        "stock"
    )
    print(f"Added watchlist: {watchlist['watchlist']['name']}")
    
    # Add price alert for Microsoft
    rule = add_rule(user_id, {
        "name": "Microsoft Dip Alert",
        "description": "Alert when MSFT drops below support",
        "asset": "MSFT",
        "asset_type": "stock",
        "rule_type": "price_below",
        "condition": {"threshold": 400},
        "actions": ["notify_email", "generate_report"],
        "priority": 1
    })
    print(f"Added rule: {rule['rule']['name']}")
    
    # Query agent
    response = query_agent(
        user_id,
        "Give me a detailed analysis of Microsoft stock with technical indicators"
    )
    print(f"\nAgent response:\n{response['response']}\n")
    
    return user_id


if __name__ == "__main__":
    print("=" * 60)
    print("FinSIght Platform - Usage Examples")
    print("=" * 60)
    print()
    
    # Run examples
    user1 = example_indian_stocks()
    print()
    
    user2 = example_crypto_trader()
    print()
    
    user3 = example_us_stocks()
    print()
    
    # Show platform stats
    print("=== Platform Statistics ===\n")
    stats = get_stats()
    print(f"Total Users: {stats['users']}")
    print(f"Total Rules: {stats['rules']}")
    print(f"Total Trades: {stats['trades']}")
    print(f"Active Agents: {stats['active_agents']}")
    print()
    
    # Start monitoring
    print("=== Starting Rule Monitoring ===\n")
    monitoring = start_monitoring(interval=60)
    print(monitoring["message"])
    print()
    
    # Manually evaluate rules
    print("=== Evaluating All Rules ===\n")
    results = evaluate_rules()
    print(f"Triggered {results['triggered_count']} rules")
    if results['results']:
        for result in results['results']:
            print(f"- {result['rule_name']} (User: {result['user_id']})")
