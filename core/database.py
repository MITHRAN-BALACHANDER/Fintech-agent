"""
Database configuration and schemas for the FinSIght Platform
"""
from sqlalchemy import create_engine, Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

Base = declarative_base()


class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String)  # Store hashed password
    phone = Column(String)
    preferred_channels = Column(JSON, default=list)
    risk_profile = Column(String, default="moderate")
    trading_enabled = Column(Boolean, default=False)
    agent_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.now)
    user_metadata = Column(JSON, default=dict)
    
    # Relationships
    watchlists = relationship("WatchlistDB", back_populates="user", cascade="all, delete-orphan")
    rules = relationship("TradingRuleDB", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("TradeExecutionDB", back_populates="user", cascade="all, delete-orphan")


class WatchlistDB(Base):
    __tablename__ = "watchlists"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    assets = Column(JSON, default=list)
    asset_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    user = relationship("UserDB", back_populates="watchlists")


class TradingRuleDB(Base):
    __tablename__ = "trading_rules"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    asset = Column(String, nullable=False, index=True)
    asset_type = Column(String, nullable=False)
    rule_type = Column(String, nullable=False)
    condition = Column(JSON, nullable=False)
    actions = Column(JSON, nullable=False)
    enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now)
    last_triggered = Column(DateTime)
    
    user = relationship("UserDB", back_populates="rules")


class TradeExecutionDB(Base):
    __tablename__ = "trade_executions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    agent_id = Column(String, nullable=False)
    rule_id = Column(String)
    asset = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="pending")
    executed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    trade_metadata = Column(JSON, default=dict)
    
    user = relationship("UserDB", back_populates="trades")


class MarketDataCache(Base):
    __tablename__ = "market_data_cache"
    
    symbol = Column(String, primary_key=True)
    price = Column(Float, nullable=False)
    change_percent = Column(Float)
    volume = Column(Integer)
    market_cap = Column(Float)
    timestamp = Column(DateTime, default=datetime.now)
    market_metadata = Column(JSON, default=dict)


# Database setup
def get_db_engine(db_url: str = None):
    """Create database engine"""
    if db_url is None:
        db_url = os.getenv("DATABASE_URL", "sqlite:///./fintech_agent.db")
    return create_engine(db_url, echo=False)


def init_database(db_url: str = None):
    """Initialize database with all tables"""
    engine = get_db_engine(db_url)
    Base.metadata.create_all(engine)
    return engine


def get_session(engine=None):
    """Get database session"""
    if engine is None:
        engine = get_db_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()
