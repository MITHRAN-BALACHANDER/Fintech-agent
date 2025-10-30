"""
Tools for managing trading rules via the AI agent
"""
from agno.tools import Toolkit
from typing import Optional, List, Dict, Any
from sqlalchemy import Engine
from sqlalchemy.orm import Session
from core.database import TradingRuleDB, get_session
from agno.utils.log import logger
from datetime import datetime
import json


class RulesTools(Toolkit):
    """Tools for managing and viewing trading rules"""
    
    def __init__(self, user_id: str, db_engine: Optional[Engine] = None, name: str = "rules_tools"):
        """
        Initialize rules tools.
        
        Args:
            user_id: User ID for filtering rules
            db_engine: SQLAlchemy database engine
            name: Name of the toolkit
        """
        super().__init__(name=name)
        self.user_id = user_id
        self.db_engine = db_engine
        
        # Register all tool methods
        self.register(self.get_rules)
        self.register(self.get_rule_by_id)
        self.register(self.get_rules_by_asset)
        self.register(self.update_rule_status)
        self.register(self.get_recently_triggered_rules)
        self.register(self.summarize_rules)
    
    def get_rules(self, enabled_only: bool = False) -> str:
        """
        Get all trading rules for the user.
        
        Args:
            enabled_only: If True, only return enabled rules
        
        Returns:
            JSON string with list of rules
        """
        try:
            if not self.db_engine:
                return json.dumps({"error": "Database not configured"})
            
            session: Session = get_session(self.db_engine)
            
            # Query rules
            query = session.query(TradingRuleDB).filter_by(user_id=self.user_id)
            
            if enabled_only:
                query = query.filter_by(enabled=True)
            
            rules = query.order_by(TradingRuleDB.priority.desc()).all()
            
            rules_list = []
            for rule in rules:
                rules_list.append({
                    "id": rule.id,
                    "name": rule.name,
                    "description": rule.description,
                    "asset": rule.asset,
                    "asset_type": rule.asset_type,
                    "rule_type": rule.rule_type,
                    "condition": rule.condition,
                    "actions": rule.actions,
                    "enabled": rule.enabled,
                    "priority": rule.priority,
                    "created_at": rule.created_at.isoformat() if rule.created_at else None,
                    "last_triggered": rule.last_triggered.isoformat() if rule.last_triggered else None
                })
            
            session.close()
            
            return json.dumps({
                "success": True,
                "count": len(rules_list),
                "rules": rules_list
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching rules: {e}")
            return json.dumps({"error": str(e)})
    
    def get_rule_by_id(self, rule_id: str) -> str:
        """
        Get details of a specific rule.
        
        Args:
            rule_id: Rule ID
        
        Returns:
            JSON string with rule details
        """
        try:
            if not self.db_engine:
                return json.dumps({"error": "Database not configured"})
            
            session: Session = get_session(self.db_engine)
            
            rule = session.query(TradingRuleDB).filter_by(
                id=rule_id,
                user_id=self.user_id
            ).first()
            
            session.close()
            
            if not rule:
                return json.dumps({
                    "success": False,
                    "error": f"Rule with ID {rule_id} not found"
                })
            
            return json.dumps({
                "success": True,
                "rule": {
                    "id": rule.id,
                    "name": rule.name,
                    "description": rule.description,
                    "asset": rule.asset,
                    "asset_type": rule.asset_type,
                    "rule_type": rule.rule_type,
                    "condition": rule.condition,
                    "actions": rule.actions,
                    "enabled": rule.enabled,
                    "priority": rule.priority,
                    "created_at": rule.created_at.isoformat() if rule.created_at else None,
                    "last_triggered": rule.last_triggered.isoformat() if rule.last_triggered else None
                }
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching rule: {e}")
            return json.dumps({"error": str(e)})
    
    def get_rules_by_asset(self, asset: str) -> str:
        """
        Get all rules for a specific asset.
        
        Args:
            asset: Asset symbol (e.g., "AAPL", "BTC")
        
        Returns:
            JSON string with list of rules for the asset
        """
        try:
            if not self.db_engine:
                return json.dumps({"error": "Database not configured"})
            
            session: Session = get_session(self.db_engine)
            
            rules = session.query(TradingRuleDB).filter_by(
                user_id=self.user_id,
                asset=asset.upper()
            ).order_by(TradingRuleDB.priority.desc()).all()
            
            rules_list = []
            for rule in rules:
                rules_list.append({
                    "id": rule.id,
                    "name": rule.name,
                    "description": rule.description,
                    "rule_type": rule.rule_type,
                    "condition": rule.condition,
                    "actions": rule.actions,
                    "enabled": rule.enabled,
                    "priority": rule.priority,
                    "last_triggered": rule.last_triggered.isoformat() if rule.last_triggered else None
                })
            
            session.close()
            
            return json.dumps({
                "success": True,
                "asset": asset.upper(),
                "count": len(rules_list),
                "rules": rules_list
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching rules for asset: {e}")
            return json.dumps({"error": str(e)})
    
    def update_rule_status(self, rule_id: str, enabled: bool) -> str:
        """
        Enable or disable a trading rule.
        
        Args:
            rule_id: Rule ID
            enabled: True to enable, False to disable
        
        Returns:
            JSON string with success status
        """
        try:
            if not self.db_engine:
                return json.dumps({"error": "Database not configured"})
            
            session: Session = get_session(self.db_engine)
            
            rule = session.query(TradingRuleDB).filter_by(
                id=rule_id,
                user_id=self.user_id
            ).first()
            
            if not rule:
                session.close()
                return json.dumps({
                    "success": False,
                    "error": f"Rule with ID {rule_id} not found"
                })
            
            rule.enabled = enabled
            session.commit()
            session.close()
            
            status = "enabled" if enabled else "disabled"
            return json.dumps({
                "success": True,
                "message": f"Rule '{rule.name}' has been {status}",
                "rule_id": rule_id,
                "enabled": enabled
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error updating rule status: {e}")
            return json.dumps({"error": str(e)})
    
    def get_recently_triggered_rules(self, limit: int = 10) -> str:
        """
        Get recently triggered rules.
        
        Args:
            limit: Maximum number of rules to return
        
        Returns:
            JSON string with list of recently triggered rules
        """
        try:
            if not self.db_engine:
                return json.dumps({"error": "Database not configured"})
            
            session: Session = get_session(self.db_engine)
            
            rules = session.query(TradingRuleDB).filter(
                TradingRuleDB.user_id == self.user_id,
                TradingRuleDB.last_triggered.isnot(None)
            ).order_by(TradingRuleDB.last_triggered.desc()).limit(limit).all()
            
            rules_list = []
            for rule in rules:
                rules_list.append({
                    "id": rule.id,
                    "name": rule.name,
                    "asset": rule.asset,
                    "rule_type": rule.rule_type,
                    "condition": rule.condition,
                    "actions": rule.actions,
                    "last_triggered": rule.last_triggered.isoformat() if rule.last_triggered else None
                })
            
            session.close()
            
            return json.dumps({
                "success": True,
                "count": len(rules_list),
                "rules": rules_list
            }, indent=2)
        
        except Exception as e:
            logger.error(f"Error fetching recently triggered rules: {e}")
            return json.dumps({"error": str(e)})
    
    def summarize_rules(self) -> str:
        """
        Get a summary of all user's rules.
        
        Returns:
            Human-readable summary of rules
        """
        try:
            if not self.db_engine:
                return "❌ Database not configured"
            
            session: Session = get_session(self.db_engine)
            
            total_rules = session.query(TradingRuleDB).filter_by(user_id=self.user_id).count()
            enabled_rules = session.query(TradingRuleDB).filter_by(
                user_id=self.user_id,
                enabled=True
            ).count()
            
            rules = session.query(TradingRuleDB).filter_by(
                user_id=self.user_id,
                enabled=True
            ).order_by(TradingRuleDB.priority.desc()).all()
            
            session.close()
            
            if total_rules == 0:
                return "📋 You don't have any trading rules set up yet. You can create rules through the Rules tab in the dashboard."
            
            summary = f"📋 **Your Trading Rules Summary**\n\n"
            summary += f"Total Rules: {total_rules}\n"
            summary += f"Active Rules: {enabled_rules}\n"
            summary += f"Inactive Rules: {total_rules - enabled_rules}\n\n"
            
            if enabled_rules > 0:
                summary += "**Active Rules:**\n\n"
                for rule in rules:
                    condition_str = f"{rule.rule_type} {rule.condition.get('threshold', 'N/A')}"
                    actions_str = ", ".join(rule.actions)
                    triggered_str = ""
                    if rule.last_triggered:
                        triggered_str = f" (Last triggered: {rule.last_triggered.strftime('%Y-%m-%d %H:%M')})"
                    
                    summary += f"• **{rule.name}** [{rule.asset}]\n"
                    summary += f"  Condition: {condition_str}\n"
                    summary += f"  Actions: {actions_str}{triggered_str}\n\n"
            
            return summary
        
        except Exception as e:
            logger.error(f"Error summarizing rules: {e}")
            return f"❌ Error getting rules summary: {str(e)}"
