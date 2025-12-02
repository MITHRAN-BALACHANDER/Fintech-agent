"""
Data models for the FinSIght Platform
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr


class AssetType(str, Enum):
    STOCK = "stock"
    CRYPTO = "crypto"
    FOREX = "forex"
    COMMODITY = "commodity"


class RuleType(str, Enum):
    PRICE_ABOVE = "price_above"
    PRICE_BELOW = "price_below"
    MOMENTUM_POSITIVE = "momentum_positive"
    MOMENTUM_NEGATIVE = "momentum_negative"
    VOLUME_SPIKE = "volume_spike"
    NEWS_SENTIMENT = "news_sentiment"
    CUSTOM_CONDITION = "custom_condition"


class ActionType(str, Enum):
    NOTIFY_EMAIL = "notify_email"
    NOTIFY_SMS = "notify_sms"
    NOTIFY_PUSH = "notify_push"
    BUY_TRIGGER = "buy_trigger"
    SELL_TRIGGER = "sell_trigger"
    GENERATE_REPORT = "generate_report"


class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"


class User(BaseModel):
    """User model with trading preferences"""
    id: str = Field(default_factory=lambda: f"user_{datetime.now().timestamp()}")
    email: EmailStr
    name: str
    password_hash: Optional[str] = None  # Store hashed password
    phone: Optional[str] = None
    preferred_channels: List[NotificationChannel] = [NotificationChannel.EMAIL]
    risk_profile: str = "moderate"  # conservative, moderate, aggressive
    trading_enabled: bool = False
    agent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Watchlist(BaseModel):
    """Asset watchlist for a user"""
    id: str = Field(default_factory=lambda: f"watchlist_{datetime.now().timestamp()}")
    user_id: str
    name: str
    assets: List[str] = Field(default_factory=list)  # e.g., ["TCS.NS", "BTC-USD"]
    asset_type: AssetType
    created_at: datetime = Field(default_factory=datetime.now)


class TradingRule(BaseModel):
    """Trading rule configuration"""
    id: str = Field(default_factory=lambda: f"rule_{datetime.now().timestamp()}")
    user_id: str
    name: str
    description: Optional[str] = None
    asset: str  # e.g., "TCS.NS", "BTC-USD"
    asset_type: AssetType
    rule_type: RuleType
    condition: Dict[str, Any]  # e.g., {"threshold": 4000, "operator": ">"}
    actions: List[ActionType]
    enabled: bool = True
    priority: int = 1
    created_at: datetime = Field(default_factory=datetime.now)
    last_triggered: Optional[datetime] = None


class MarketData(BaseModel):
    """Market data snapshot"""
    symbol: str
    price: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TradeExecution(BaseModel):
    """Trade execution record"""
    id: str = Field(default_factory=lambda: f"trade_{datetime.now().timestamp()}")
    user_id: str
    agent_id: str
    rule_id: Optional[str] = None
    asset: str
    action: str  # buy, sell
    quantity: float
    price: float
    status: str  # pending, executed, failed, cancelled
    executed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgentConfig(BaseModel):
    """Configuration for a personalized agent"""
    user_id: str
    agent_name: str
    description: str
    watchlists: List[Watchlist] = Field(default_factory=list)
    rules: List[TradingRule] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    tools_enabled: List[str] = Field(default_factory=list)
