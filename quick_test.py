"""
Quick test script for the FinSIght Platform
"""
import requests
import json

BASE_URL = "http://localhost:7777"

print("=" * 70)
print("FinSIght PLATFORM - QUICK TEST")
print("=" * 70)
print()

# Test 1: Health Check
print("1. Testing Health Check...")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"   ✓ Health check passed: {response.json()}")
except Exception as e:
    print(f"   ✗ Health check failed: {e}")
    exit(1)

# Test 2: Platform Stats
print("\n2. Checking Platform Stats...")
try:
    response = requests.get(f"{BASE_URL}/api/stats", timeout=5)
    stats = response.json()
    print(f"   ✓ Users: {stats['users']}, Rules: {stats['rules']}, Trades: {stats['trades']}")
except Exception as e:
    print(f"   ✗ Stats check failed: {e}")

# Test 3: Create User
print("\n3. Creating Test User...")
try:
    response = requests.post(f"{BASE_URL}/api/users", json={
        "email": "test@example.com",
        "name": "Test Trader",
        "risk_profile": "moderate"
    }, timeout=10)
    
    if response.status_code == 200:
        user_data = response.json()
        user_id = user_data["user"]["id"]
        print(f"   ✓ User created: {user_data['user']['name']} (ID: {user_id})")
    else:
        print(f"   ✗ User creation failed: {response.text}")
        user_id = None
except Exception as e:
    print(f"   ✗ User creation failed: {e}")
    user_id = None

# Test 4: Add Watchlist
if user_id:
    print("\n4. Adding Watchlist...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/users/{user_id}/watchlists",
            json={
                "name": "Test Stocks",
                "assets": ["TCS.NS", "INFY.NS"],
                "asset_type": "stock"
            },
            timeout=10
        )
        if response.status_code == 200:
            watchlist = response.json()
            print(f"   ✓ Watchlist added: {watchlist['watchlist']['name']}")
        else:
            print(f"   ✗ Watchlist creation failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Watchlist creation failed: {e}")

# Test 5: Add Trading Rule
if user_id:
    print("\n5. Adding Trading Rule...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/users/{user_id}/rules",
            json={
                "name": "TCS Price Alert",
                "description": "Alert when TCS > 4000",
                "asset": "TCS.NS",
                "asset_type": "stock",
                "rule_type": "price_above",
                "condition": {"threshold": 4000},
                "actions": ["notify_email"],
                "priority": 1
            },
            timeout=10
        )
        if response.status_code == 200:
            rule = response.json()
            print(f"   ✓ Rule added: {rule['rule']['name']}")
        else:
            print(f"   ✗ Rule creation failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Rule creation failed: {e}")

# Test 6: Query Agent
if user_id:
    print("\n6. Querying User's Agent...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/users/{user_id}/query",
            json={
                "message": "What's the current price of TCS stock?",
                "stream": False
            },
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Agent responded:")
            print(f"   {result['response'][:200]}...")
        else:
            print(f"   ✗ Agent query failed: {response.text}")
    except Exception as e:
        print(f"   ✗ Agent query failed: {e}")

# Test 7: Final Stats
print("\n7. Final Platform Stats...")
try:
    response = requests.get(f"{BASE_URL}/api/stats", timeout=5)
    stats = response.json()
    print(f"   ✓ Users: {stats['users']}, Rules: {stats['rules']}, Agents: {stats['active_agents']}")
except Exception as e:
    print(f"   ✗ Stats check failed: {e}")

print()
print("=" * 70)
print("TEST COMPLETE")
print("=" * 70)
print("\n✨ Platform is running at: http://localhost:7777")
print("📚 API Documentation: http://localhost:7777/docs")
print("\nTo run full examples: python examples/usage_example.py")
print()
