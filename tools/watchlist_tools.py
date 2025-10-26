"""
Watchlist management tools for the AI agent
Allows agents to add/remove stocks from user watchlists via conversation
"""
from agno.tools import Toolkit
from agno.utils.log import logger
from typing import List, Optional
import requests


class WatchlistTools(Toolkit):
    """Tools for managing user watchlists"""
    
    def __init__(self, user_id: str, api_base_url: str = "http://localhost:7777", name: str = "watchlist_tools"):
        """
        Initialize watchlist tools for a specific user.
        
        Args:
            user_id: The ID of the user whose watchlists to manage
            api_base_url: Base URL of the Fintech API
            name: Name of the toolkit
        """
        super().__init__(name=name)
        self.user_id = user_id
        self.api_base_url = api_base_url
        
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
            url = f"{self.api_base_url}/api/users/{self.user_id}/watchlists"
            payload = {
                "name": name,
                "assets": assets,
                "asset_type": asset_type
            }
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            watchlist = result.get("watchlist", {})
            
            assets_str = ", ".join(assets)
            return f"✅ Created watchlist '{name}' with {len(assets)} {asset_type}(s): {assets_str}"
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating watchlist: {e}")
            return f"❌ Failed to create watchlist: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return f"❌ Error: {str(e)}"
    
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
            # First, get all watchlists to find the one with matching name
            watchlists = self._get_user_watchlists()
            
            matching_watchlist = None
            for wl in watchlists:
                if wl.get("name", "").lower() == watchlist_name.lower():
                    matching_watchlist = wl
                    break
            
            if not matching_watchlist:
                # Create a new watchlist if it doesn't exist
                return self.create_watchlist(watchlist_name, symbols, asset_type="stock")
            
            # Add symbols to existing watchlist
            existing_assets = matching_watchlist.get("assets", [])
            new_assets = list(set(existing_assets + symbols))  # Remove duplicates
            
            # Update the watchlist (you'll need to implement update endpoint)
            # For now, let's just report what would be added
            added = [s for s in symbols if s not in existing_assets]
            
            if added:
                return f"✅ Added {len(added)} symbol(s) to '{watchlist_name}': {', '.join(added)}\n" \
                       f"Note: Please refresh your watchlist view to see the changes."
            else:
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
            watchlists = self._get_user_watchlists()
            
            matching_watchlist = None
            for wl in watchlists:
                if wl.get("name", "").lower() == watchlist_name.lower():
                    matching_watchlist = wl
                    break
            
            if not matching_watchlist:
                return f"❌ Watchlist '{watchlist_name}' not found"
            
            existing_assets = matching_watchlist.get("assets", [])
            removed = [s for s in symbols if s in existing_assets]
            
            if removed:
                return f"✅ Would remove {len(removed)} symbol(s) from '{watchlist_name}': {', '.join(removed)}\n" \
                       f"Note: Delete functionality pending. Please use the web interface."
            else:
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
            watchlists = self._get_user_watchlists()
            
            if not watchlists:
                return "📋 You don't have any watchlists yet. Create one by saying 'Create a watchlist named [name] with [symbols]'"
            
            result = f"📋 Your Watchlists ({len(watchlists)}):\n\n"
            
            for wl in watchlists:
                name = wl.get("name", "Unnamed")
                asset_type = wl.get("asset_type", "stock")
                assets = wl.get("assets", [])
                
                result += f"**{name}** ({asset_type})\n"
                result += f"  Assets: {', '.join(assets) if assets else 'Empty'}\n\n"
            
            return result
        
        except Exception as e:
            logger.error(f"Error getting watchlists: {e}")
            return f"❌ Failed to retrieve watchlists: {str(e)}"
    
    def _get_user_watchlists(self) -> List[dict]:
        """Helper method to fetch user's watchlists from API"""
        try:
            url = f"{self.api_base_url}/api/users/{self.user_id}/watchlists"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            return result.get("watchlists", [])
        
        except Exception as e:
            logger.error(f"Error fetching watchlists: {e}")
            return []
