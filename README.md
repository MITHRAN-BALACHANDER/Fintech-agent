# 🚀 FinSIght Platform

> **Scalable Multi-Tenant AI Trading Assistant Platform powered by AGNO**

A production-ready platform that creates personalized AI trading agents for each user. Each agent acts as an intelligent financial co-pilot, monitoring markets, executing rules, and providing insights tailored to individual investment strategies.

---

## 🌟 Key Features

### Dynamic & Personalized Agents
- **One Agent Per User**: Each user gets their own AI agent running in an isolated context
- **Custom Rules Engine**: Define price alerts, momentum triggers, volume spikes, and custom conditions
- **Multi-Asset Support**: Stocks (Indian NSE/BSE, US markets), Cryptocurrencies, Forex, Commodities

### Intelligent Automation
- **Real-Time Monitoring**: Continuous evaluation of trading rules across all users
- **Multi-Channel Notifications**: Email, SMS, Push notifications, Webhooks
- **Automated Actions**: Buy/sell triggers, report generation, alerts
- **Market Intelligence**: Fetch prices, technical indicators, sentiment analysis, news

### Scalable Architecture
- **Multi-Tenant Design**: Thousands of users with isolated agents
- **AgentOS Integration**: Built on AGNO's AgentOS for robust agent management
- **Background Processing**: Async rule evaluation and monitoring
- **Database-Backed**: Persistent storage for users, rules, trades, and history

---

## 📦 Quick Start

```powershell
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Run the platform
python -m uvicorn platform.fintech_os:app --host 0.0.0.0 --port 7777 --reload
```

**Access**: http://localhost:7777 | **API Docs**: http://localhost:7777/docs

---

## 🎯 Usage Examples

See `examples/usage_example.py` for complete examples. Quick example:

```python
import requests
BASE_URL = "http://localhost:7777"

# Create user
response = requests.post(f"{BASE_URL}/api/users", json={
    "email": "trader@example.com",
    "name": "John Doe",
    "risk_profile": "moderate"
})
user_id = response.json()["user"]["id"]

# Add TCS price alert
requests.post(f"{BASE_URL}/api/users/{user_id}/rules", json={
    "name": "TCS Alert",
    "asset": "TCS.NS",
    "asset_type": "stock",
    "rule_type": "price_above",
    "condition": {"threshold": 4000},
    "actions": ["notify_email"]
})

# Query agent
response = requests.post(f"{BASE_URL}/api/users/{user_id}/query", json={
    "message": "Analyze TCS stock and recommend action"
})
print(response.json()["response"])
```

---

## 🏗️ Architecture

```
AgentOS Platform
├── User Agents (one per user)
│   ├── Market Data Tools
│   ├── Notification Tools
│   └── Custom Instructions
├── Rule Engine
│   ├── Price Alerts
│   ├── Momentum Tracking
│   └── Custom Conditions
├── Background Monitoring
└── Database (Users, Rules, Trades)
```

**Tech Stack**: AGNO AI, FastAPI, SQLAlchemy, yfinance, Python 3.11+

---

## 🚀 Deployment

**Docker**:
```bash
docker-compose up -d
```

**Production**:
```bash
gunicorn platform.fintech_os:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:7777
```

See full deployment guide in `docs/DEPLOYMENT.md`

---

## 📡 Key API Endpoints

- `POST /api/users` - Create user + agent
- `POST /api/users/{user_id}/watchlists` - Add watchlist
- `POST /api/users/{user_id}/rules` - Add trading rule
- `POST /api/users/{user_id}/query` - Query agent
- `POST /api/monitoring/start` - Start auto-monitoring
- `GET /api/stats` - Platform statistics

Full API docs: http://localhost:7777/docs

---

## 🔧 Configuration

Key environment variables in `.env`:
- `GEMINI_API_KEY` or `OPENAI_API_KEY`
- `DATABASE_URL` (SQLite default, PostgreSQL for production)
- `SMTP_*` for email notifications
- `RULE_EVALUATION_INTERVAL` (monitoring frequency)

---

## 📝 License

MIT License - See LICENSE file

---

**Built with ❤️ using AGNO AI | Dynamic, multi-agent AI system for context-aware financial reasoning and intelligent workflow automation**
