"""
Watchlist management tools for the AI agent
Allows agents to add/remove stocks from user watchlists via conversation
"""
from agno.tools import Toolkit
from agno.utils.log import logger
from typing import List, Optional
from core.database import get_session, WatchlistDB
from core.models import Watchlist
from sqlalchemy import Engine


class WatchlistTools(Toolkit):
    """Tools for managing user watchlists"""
    
    def __init__(self, user_id: str, db_engine: Engine, name: str = "watchlist_tools"):
        """
        Initialize watchlist tools for a specific user.
        
        Args:
            user_id: The ID of the user whose watchlists to manage
            db_engine: SQLAlchemy database engine for direct database access
            name: Name of the toolkit
        """
        super().__init__(name=name)
        self.user_id = user_id
        self.db_engine = db_engine
        
        self.register(self.add_to_watchlist)
        self.register(self.remove_from_watchlist)
        self.register(self.create_watchlist)
        self.register(self.get_watchlists)
    
    def create_watchlist(self, name: str, assets: List[str], asset_type: str = "stock") -> str:
        """
        Create a new watchlist for the user.
        
        Args:
            name: Name of the watchlist (e.g., "Tech Stocks", "Crypto Portfolio")
            assets: List of asset symbols (e.g., ["AAPL", "GOOGL"] or ["BTC", "ETH"])
            asset_type: Type of assets - "stock" or "crypto"
        
        Returns:
            Success message with watchlist details
        """
        try:
            session = get_session(self.db_engine)
            
            # Create watchlist model
            watchlist = Watchlist(
                user_id=self.user_id,
                name=name,
                assets=assets,
                asset_type=asset_type
            )
            
            # Save to database
            watchlist_db = WatchlistDB(
                id=watchlist.id,
                user_id=self.user_id,
                name=watchlist.name,
                assets=watchlist.assets,
                asset_type=watchlist.asset_type,
                created_at=watchlist.created_at
            )
            
            session.add(watchlist_db)
            session.commit()
            session.close()
            
            assets_str = ", ".join(assets)
            logger.info(f"Created watchlist '{name}' for user {self.user_id}")
            return f"✅ Created watchlist '{name}' with {len(assets)} {asset_type}(s): {assets_str}"
        
        except Exception as e:
            logger.error(f"Error creating watchlist: {e}")
            return f"❌ Failed to create watchlist: {str(e)}"
    
    def add_to_watchlist(self, watchlist_name: str, symbols: List[str]) -> str:
        """
        Add stock/crypto symbols to an existing watchlist.
        
        Args:
            watchlist_name: Name of the watchlist to add to
            symbols: List of symbols to add (e.g., ["TCS.NS", "INFY.NS"] or ["BTC", "ETH"])
        
        Returns:
            Success or error message
        """
        try:
            session = get_session(self.db_engine)
            
            # Find watchlist by name
            watchlist_db = session.query(WatchlistDB).filter(
                WatchlistDB.user_id == self.user_id,
                WatchlistDB.name.ilike(watchlist_name)  # Case-insensitive search
            ).first()
            
            if not watchlist_db:
                session.close()
                # Create a new watchlist if it doesn't exist
                return self.create_watchlist(watchlist_name, symbols, asset_type="stock")
            
            # Add symbols to existing watchlist (remove duplicates)
            existing_assets = set(watchlist_db.assets)
            new_symbols = [s.upper() for s in symbols if s.upper() not in existing_assets]
            
            if new_symbols:
                watchlist_db.assets = list(existing_assets.union(new_symbols))
                session.commit()
                session.close()
                
                logger.info(f"Added {len(new_symbols)} symbols to watchlist '{watchlist_name}'")
                return f"✅ Added {len(new_symbols)} symbol(s) to '{watchlist_name}': {', '.join(new_symbols)}"
            else:
                session.close()
                return f"ℹ️ All symbols already exist in '{watchlist_name}'"
        
        except Exception as e:
            logger.error(f"Error adding to watchlist: {e}")
            return f"❌ Failed to add to watchlist: {str(e)}"
    
    def remove_from_watchlist(self, watchlist_name: str, symbols: List[str]) -> str:
        """
        Remove stock/crypto symbols from a watchlist.
        
        Args:
            watchlist_name: Name of the watchlist to remove from
            symbols: List of symbols to remove
        
        Returns:
            Success or error message
        """
        try:
            session = get_session(self.db_engine)
            
            # Find watchlist by name
            watchlist_db = session.query(WatchlistDB).filter(
                WatchlistDB.user_id == self.user_id,
                WatchlistDB.name.ilike(watchlist_name)
            ).first()
            
            if not watchlist_db:
                session.close()
                return f"❌ Watchlist '{watchlist_name}' not found"
            
            # Remove symbols
            existing_assets = set(watchlist_db.assets)
            symbols_upper = [s.upper() for s in symbols]
            removed = [s for s in symbols_upper if s in existing_assets]
            
            if removed:
                watchlist_db.assets = [a for a in watchlist_db.assets if a not in removed]
                session.commit()
                session.close()
                
                logger.info(f"Removed {len(removed)} symbols from watchlist '{watchlist_name}'")
                return f"✅ Removed {len(removed)} symbol(s) from '{watchlist_name}': {', '.join(removed)}"
            else:
                session.close()
                return f"ℹ️ None of the specified symbols found in '{watchlist_name}'"
        
        except Exception as e:
            logger.error(f"Error removing from watchlist: {e}")
            return f"❌ Failed to remove from watchlist: {str(e)}"
    
    def get_watchlists(self) -> str:
        """
        Get all watchlists for the user.
        
        Returns:
            Formatted string with all watchlists and their contents
        """
        try:
            session = get_session(self.db_engine)
            
            watchlists_db = session.query(WatchlistDB).filter(
                WatchlistDB.user_id == self.user_id
            ).all()
            
            session.close()
            
            if not watchlists_db:
                return "📋 You don't have any watchlists yet. Create one by saying 'Create a watchlist named [name] with [symbols]'"
            
            result = f"📋 Your Watchlists ({len(watchlists_db)}):\n\n"
            
            for wl in watchlists_db:
                result += f"**{wl.name}** ({wl.asset_type})\n"
                result += f"  Assets: {', '.join(wl.assets) if wl.assets else 'Empty'}\n\n"
            
            return result
        
        except Exception as e:
            logger.error(f"Error getting watchlists: {e}")
            return f"❌ Failed to retrieve watchlists: {str(e)}"
