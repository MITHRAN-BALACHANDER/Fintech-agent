"""
FinSIght Platform - Multi-tenant AgentOS
Main platform orchestrating personalized trading agents
"""
from dotenv import load_dotenv
import os

# Load environment variables before anything else
load_dotenv()

from agno.os.app import AgentOS
from agno.agent import Agent
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio

from core.models import (
    User, TradingRule, Watchlist, AgentConfig,
    RuleType, ActionType, AssetType, NotificationChannel
)
from core.database import (
    init_database, get_session,
    UserDB, WatchlistDB, TradingRuleDB, TradeExecutionDB
)
from core.agent_factory import AgentFactory
from core.rule_engine import RuleEngine
from core.auth import hash_password, verify_password
from agno.utils.log import logger


# Request/Response Models
class UserCreate(BaseModel):
    email: str
    name: str
    password: str  # Plain text password (will be hashed)
    phone: Optional[str] = None
    risk_profile: str = "moderate"
    preferred_channels: List[NotificationChannel] = [NotificationChannel.EMAIL]


class UserLogin(BaseModel):
    email: str
    password: str


class WatchlistCreate(BaseModel):
    name: str
    assets: List[str]
    asset_type: AssetType


class RuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    asset: str
    asset_type: AssetType
    rule_type: RuleType
    condition: Dict[str, Any]
    actions: List[ActionType]
    priority: int = 1


class QueryRequest(BaseModel):
    message: str
    stream: bool = False


class FintechAgentPlatform:
    """Main platform class managing all user agents"""
    
    def __init__(self, db_url: str = None):
        """Initialize the platform"""
        # Initialize database
        self.engine = init_database(db_url)
        
        # Initialize agent factory and rule engine with database engine
        self.agent_factory = AgentFactory(db_engine=self.engine)
        self.rule_engine = RuleEngine()
        
        # Agent registry
        self.agents: Dict[str, Agent] = {}
        
        # Background monitoring
        self.monitoring_active = False
        
        logger.info("FinSIght Platform initialized")
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user and their personal agent"""
        try:
            session = get_session(self.engine)
            
            # Check if user exists
            existing = session.query(UserDB).filter_by(email=user_data.email).first()
            if existing:
                session.close()
                raise ValueError(f"User with email {user_data.email} already exists")
            
            # Hash password
            password_hash = hash_password(user_data.password)
            
            # Create user
            user = User(
                email=user_data.email,
                name=user_data.name,
                password_hash=password_hash,
                phone=user_data.phone,
                risk_profile=user_data.risk_profile,
                preferred_channels=user_data.preferred_channels
            )
            
            # Create agent
            agent_config = AgentConfig(
                user_id=user.id,
                agent_name=f"{user.name}'s Trading Assistant",
                description=f"Personal AI trading assistant for {user.name}",
                preferences={
                    "risk_profile": user.risk_profile,
                    "email": user.email,
                    "phone": user.phone,
                    "name": user.name
                }
            )
            
            agent = self.agent_factory.create_agent(agent_config)
            user.agent_id = f"agent_{user.id}"
            
            # Save to database
            user_db = UserDB(
                id=user.id,
                email=user.email,
                name=user.name,
                password_hash=password_hash,
                phone=user.phone,
                preferred_channels=user.preferred_channels,
                risk_profile=user.risk_profile,
                agent_id=user.agent_id,
                created_at=user.created_at,
                user_metadata=user.metadata
            )
            
            session.add(user_db)
            session.commit()
            session.close()
            
            # Store agent reference
            self.agents[user.id] = agent
            
            logger.info(f"Created user and agent: {user.email}")
            return user
        
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    def add_watchlist(self, user_id: str, watchlist_data: WatchlistCreate) -> Watchlist:
        """Add a watchlist for a user"""
        try:
            session = get_session(self.engine)
            
            watchlist = Watchlist(
                user_id=user_id,
                name=watchlist_data.name,
                assets=watchlist_data.assets,
                asset_type=watchlist_data.asset_type
            )
            
            watchlist_db = WatchlistDB(
                id=watchlist.id,
                user_id=user_id,
                name=watchlist.name,
                assets=watchlist.assets,
                asset_type=watchlist.asset_type,
                created_at=watchlist.created_at
            )
            
            session.add(watchlist_db)
            session.commit()
            session.close()
            
            logger.info(f"Added watchlist '{watchlist.name}' for user {user_id}")
            return watchlist
        
        except Exception as e:
            logger.error(f"Error adding watchlist: {e}")
            raise
    
    def add_rule(self, user_id: str, rule_data: RuleCreate) -> TradingRule:
        """Add a trading rule for a user"""
        try:
            session = get_session(self.engine)
            
            rule = TradingRule(
                user_id=user_id,
                name=rule_data.name,
                description=rule_data.description,
                asset=rule_data.asset,
                asset_type=rule_data.asset_type,
                rule_type=rule_data.rule_type,
                condition=rule_data.condition,
                actions=rule_data.actions,
                priority=rule_data.priority
            )
            
            rule_db = TradingRuleDB(
                id=rule.id,
                user_id=user_id,
                name=rule.name,
                description=rule.description,
                asset=rule.asset,
                asset_type=rule.asset_type,
                rule_type=rule.rule_type,
                condition=rule.condition,
                actions=rule.actions,
                priority=rule.priority,
                enabled=rule.enabled,
                created_at=rule.created_at
            )
            
            session.add(rule_db)
            session.commit()
            session.close()
            
            logger.info(f"Added rule '{rule.name}' for user {user_id}")
            return rule
        
        except Exception as e:
            logger.error(f"Error adding rule: {e}")
            raise
    
    def query_agent(self, user_id: str, message: str, stream: bool = False, retry_count: int = 0) -> str:
        """Query a user's personal agent with retry logic"""
        max_retries = 2
        
        try:
            agent = self.agents.get(user_id)
            if not agent:
                raise ValueError(f"No agent found for user {user_id}")
            
            if stream:
                agent.print_response(message, stream=True)
                return "Streaming response..."
            else:
                response = agent.run(message)
                return response.content
        
        except Exception as e:
            error_str = str(e)
            logger.error(f"Error querying agent (attempt {retry_count + 1}/{max_retries + 1}): {error_str}")
            
            # Check for quota/rate limit errors
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                if retry_count < max_retries:
                    logger.warning(f"API quota exceeded, attempting retry {retry_count + 1}")
                    import time
                    # Exponential backoff: 2, 4, 8 seconds
                    wait_time = 2 ** (retry_count + 1)
                    logger.info(f"Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    return self.query_agent(user_id, message, stream, retry_count + 1)
                else:
                    # All retries exhausted
                    raise ValueError(
                        "Our AI service is currently experiencing high demand. "
                        "Please try again in a few moments. If the issue persists, "
                        "contact support or check your API quota at https://aistudio.google.com/"
                    )
            
            # For other errors, provide helpful message
            if "API key" in error_str or "authentication" in error_str.lower():
                raise ValueError("AI service authentication failed. Please contact support.")
            
            # Generic error
            raise ValueError(f"Unable to process your request: {error_str}")
    
    def evaluate_rules(self, user_id: Optional[str] = None):
        """Evaluate trading rules for one or all users"""
        try:
            session = get_session(self.engine)
            
            if user_id:
                users = session.query(UserDB).filter_by(id=user_id).all()
            else:
                users = session.query(UserDB).all()
            
            results = []
            for user in users:
                rules = session.query(TradingRuleDB).filter_by(
                    user_id=user.id,
                    enabled=True
                ).all()
                
                for rule_db in rules:
                    rule = TradingRule(
                        id=rule_db.id,
                        user_id=rule_db.user_id,
                        name=rule_db.name,
                        description=rule_db.description,
                        asset=rule_db.asset,
                        asset_type=rule_db.asset_type,
                        rule_type=rule_db.rule_type,
                        condition=rule_db.condition,
                        actions=rule_db.actions,
                        priority=rule_db.priority,
                        enabled=rule_db.enabled,
                        created_at=rule_db.created_at,
                        last_triggered=rule_db.last_triggered
                    )
                    
                    result = self.rule_engine.evaluate_rule(
                        rule,
                        user.email,
                        user.phone
                    )
                    
                    if result.get("triggered"):
                        results.append({
                            "user_id": user.id,
                            "rule_id": rule.id,
                            "rule_name": rule.name,
                            "result": result
                        })
            
            session.close()
            return results
        
        except Exception as e:
            logger.error(f"Error evaluating rules: {e}")
            raise
    
    async def start_monitoring(self, interval: int = 60):
        """Start background rule monitoring"""
        self.monitoring_active = True
        logger.info(f"Started rule monitoring (interval: {interval}s)")
        
        while self.monitoring_active:
            try:
                logger.info("Evaluating all trading rules...")
                results = self.evaluate_rules()
                if results:
                    logger.info(f"Triggered {len(results)} rules")
                await asyncio.sleep(interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(interval)
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring_active = False
        logger.info("Stopped rule monitoring")
    
    def get_user_agents(self) -> List[Agent]:
        """Get all active user agents"""
        return list(self.agents.values())


# Initialize platform
platform = FintechAgentPlatform()

# Create a placeholder agent for AgentOS initialization
from agno.agent import Agent
from agno.models.google import Gemini

placeholder_agent = Agent(
    name="Platform Admin Agent",
    model=Gemini(id="gemini-flash-latest", api_key=os.getenv("GOOGLE_API_KEY")),
    instructions="You are the platform administrator assistant.",
    description="Admin agent for platform management"
)

# Create AgentOS
agnos = AgentOS(
    name="FinSIght Platform",
    description="Multi-tenant AI trading assistant platform",
    agents=[placeholder_agent],  # Start with placeholder, add user agents dynamically
    version="1.0.0"
)

# Get FastAPI app
app = agnos.get_app()


# Custom API Endpoints
@app.post("/api/users", response_model=Dict[str, Any])
async def create_user_endpoint(user_data: UserCreate):
    """Create a new user and their personal agent"""
    try:
        user = platform.create_user(user_data)
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone,
                "agent_id": user.agent_id,
                "risk_profile": user.risk_profile,
                "preferred_channels": [ch.value for ch in user.preferred_channels]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/auth/login")
async def login_endpoint(login_data: UserLogin):
    """Login a user with email and password"""
    try:
        session = get_session(platform.engine)
        
        # Find user by email
        user_db = session.query(UserDB).filter_by(email=login_data.email).first()
        
        if not user_db:
            session.close()
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(login_data.password, user_db.password_hash):
            session.close()
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Load agent if not already loaded
        if user_db.id not in platform.agents:
            agent_config = AgentConfig(
                user_id=user_db.id,
                agent_name=f"{user_db.name}'s Trading Assistant",
                description=f"Personal AI trading assistant for {user_db.name}",
                preferences={
                    "risk_profile": user_db.risk_profile,
                    "email": user_db.email,
                    "phone": user_db.phone,
                    "name": user_db.name
                }
            )
            agent = platform.agent_factory.create_agent(agent_config)
            platform.agents[user_db.id] = agent
        
        session.close()
        
        return {
            "success": True,
            "user": {
                "id": user_db.id,
                "email": user_db.email,
                "name": user_db.name,
                "phone": user_db.phone,
                "agent_id": user_db.agent_id,
                "risk_profile": user_db.risk_profile,
                "preferred_channels": user_db.preferred_channels or []
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users/{user_id}")
async def get_user_endpoint(user_id: str):
    """Get user details by ID"""
    try:
        session = get_session(platform.engine)
        
        user_db = session.query(UserDB).filter_by(id=user_id).first()
        
        if not user_db:
            session.close()
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = {
            "id": user_db.id,
            "email": user_db.email,
            "name": user_db.name,
            "phone": user_db.phone,
            "agent_id": user_db.agent_id,
            "risk_profile": user_db.risk_profile,
            "preferred_channels": user_db.preferred_channels or []
        }
        
        session.close()
        return {"success": True, "user": user_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/users/{user_id}/watchlists")
async def add_watchlist_endpoint(user_id: str, watchlist_data: WatchlistCreate):
    """Add a watchlist for a user"""
    try:
        watchlist = platform.add_watchlist(user_id, watchlist_data)
        return {
            "success": True,
            "watchlist": {
                "id": watchlist.id,
                "name": watchlist.name,
                "assets": watchlist.assets
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/users/{user_id}/watchlists")
async def get_watchlists_endpoint(user_id: str):
    """Get all watchlists for a user"""
    try:
        session = get_session(platform.engine)
        watchlists_db = session.query(WatchlistDB).filter_by(user_id=user_id).all()
        session.close()
        
        watchlists = []
        for wl_db in watchlists_db:
            watchlists.append({
                "id": wl_db.id,
                "user_id": wl_db.user_id,
                "name": wl_db.name,
                "assets": wl_db.assets,
                "asset_type": wl_db.asset_type,
                "created_at": wl_db.created_at.isoformat()
            })
        return watchlists
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/users/{user_id}/watchlists/{watchlist_id}")
async def delete_watchlist_endpoint(user_id: str, watchlist_id: str):
    """Delete a watchlist"""
    try:
        session = get_session(platform.engine)
        watchlist = session.query(WatchlistDB).filter_by(id=watchlist_id, user_id=user_id).first()
        if watchlist:
            session.delete(watchlist)
            session.commit()
        session.close()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/users/{user_id}/rules")
async def add_rule_endpoint(user_id: str, rule_data: RuleCreate):
    """Add a trading rule for a user"""
    try:
        rule = platform.add_rule(user_id, rule_data)
        return {
            "success": True,
            "rule": {
                "id": rule.id,
                "name": rule.name,
                "asset": rule.asset,
                "rule_type": rule.rule_type
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/users/{user_id}/rules")
async def get_rules_endpoint(user_id: str):
    """Get all trading rules for a user"""
    try:
        session = get_session(platform.engine)
        rules_db = session.query(TradingRuleDB).filter_by(user_id=user_id).all()
        session.close()
        
        rules = []
        for rule_db in rules_db:
            rules.append({
                "id": rule_db.id,
                "user_id": rule_db.user_id,
                "name": rule_db.name,
                "description": rule_db.description,
                "asset": rule_db.asset,
                "asset_type": rule_db.asset_type,
                "rule_type": rule_db.rule_type,
                "condition": rule_db.condition,
                "actions": rule_db.actions,
                "priority": rule_db.priority,
                "enabled": rule_db.enabled,
                "last_triggered": rule_db.last_triggered.isoformat() if rule_db.last_triggered else None,
                "created_at": rule_db.created_at.isoformat()
            })
        return rules
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/users/{user_id}/rules/{rule_id}/toggle")
async def toggle_rule_endpoint(user_id: str, rule_id: str):
    """Toggle a trading rule on/off"""
    try:
        session = get_session(platform.engine)
        rule = session.query(TradingRuleDB).filter_by(id=rule_id, user_id=user_id).first()
        if rule:
            rule.enabled = not rule.enabled
            session.commit()
        session.close()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/users/{user_id}/rules/{rule_id}")
async def delete_rule_endpoint(user_id: str, rule_id: str):
    """Delete a trading rule"""
    try:
        session = get_session(platform.engine)
        rule = session.query(TradingRuleDB).filter_by(id=rule_id, user_id=user_id).first()
        if rule:
            session.delete(rule)
            session.commit()
        session.close()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/users/{user_id}/query")
async def query_agent_endpoint(user_id: str, query: QueryRequest):
    """Query a user's personal agent"""
    try:
        response = platform.query_agent(user_id, query.message, query.stream)
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/rules/evaluate")
async def evaluate_rules_endpoint(background_tasks: BackgroundTasks, user_id: Optional[str] = None):
    """Manually trigger rule evaluation"""
    try:
        results = platform.evaluate_rules(user_id)
        return {
            "success": True,
            "triggered_count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/monitoring/start")
async def start_monitoring_endpoint(background_tasks: BackgroundTasks, interval: int = 60):
    """Start background rule monitoring"""
    if not platform.monitoring_active:
        background_tasks.add_task(platform.start_monitoring, interval)
        return {"success": True, "message": f"Monitoring started (interval: {interval}s)"}
    return {"success": False, "message": "Monitoring already active"}


@app.post("/api/monitoring/stop")
async def stop_monitoring_endpoint():
    """Stop background rule monitoring"""
    platform.stop_monitoring()
    return {"success": True, "message": "Monitoring stopped"}


@app.get("/api/monitoring/status")
async def get_monitoring_status():
    """Get monitoring status"""
    return {"active": platform.monitoring_active}


@app.get("/api/stats")
async def get_stats():
    """Get platform statistics"""
    try:
        session = get_session(platform.engine)
        user_count = session.query(UserDB).count()
        rule_count = session.query(TradingRuleDB).count()
        trade_count = session.query(TradeExecutionDB).count()
        session.close()
        
        return {
            "total_users": user_count,
            "total_rules": rule_count,
            "total_trades": trade_count,
            "active_agents": len(platform.agents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user-specific statistics"""
    try:
        session = get_session(platform.engine)
        
        # Count user's watchlists
        watchlist_count = session.query(WatchlistDB).filter_by(user_id=user_id).count()
        
        # Count user's rules (total and active)
        total_rules = session.query(TradingRuleDB).filter_by(user_id=user_id).count()
        active_rules = session.query(TradingRuleDB).filter_by(user_id=user_id, enabled=True).count()
        
        # Count user's trades
        trade_count = session.query(TradeExecutionDB).filter_by(user_id=user_id).count()
        
        # Get recent trades
        recent_trades = session.query(TradeExecutionDB).filter_by(user_id=user_id).order_by(
            TradeExecutionDB.created_at.desc()
        ).limit(10).all()
        
        trades_list = []
        for trade in recent_trades:
            trades_list.append({
                "id": trade.id,
                "asset": trade.asset,
                "action": trade.action,
                "quantity": trade.quantity,
                "price": trade.price,
                "status": trade.status,
                "created_at": trade.created_at.isoformat(),
                "executed_at": trade.executed_at.isoformat() if trade.executed_at else None
            })
        
        # Get recently triggered rules
        recent_rules = session.query(TradingRuleDB).filter(
            TradingRuleDB.user_id == user_id,
            TradingRuleDB.last_triggered.isnot(None)
        ).order_by(
            TradingRuleDB.last_triggered.desc()
        ).limit(10).all()
        
        triggered_rules = []
        for rule in recent_rules:
            triggered_rules.append({
                "id": rule.id,
                "name": rule.name,
                "asset": rule.asset,
                "rule_type": rule.rule_type,
                "last_triggered": rule.last_triggered.isoformat()
            })
        
        session.close()
        
        return {
            "watchlists": watchlist_count,
            "total_rules": total_rules,
            "active_rules": active_rules,
            "total_trades": trade_count,
            "recent_trades": trades_list,
            "recent_rule_triggers": triggered_rules,
            "agent_active": user_id in platform.agents
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
