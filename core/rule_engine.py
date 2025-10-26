"""
Rule evaluation engine for processing trading rules
"""
from typing import List, Dict, Any, Optional
from core.models import TradingRule, MarketData, RuleType, ActionType
from core.database import get_session, TradingRuleDB, TradeExecutionDB
from tools.market_tools import MarketDataTools
from tools.notification_tools import NotificationTools
from agno.utils.log import logger
from datetime import datetime
import yfinance as yf


class RuleEngine:
    """Evaluates trading rules and executes actions"""
    
    def __init__(self):
        self.market_tools = MarketDataTools()
        self.notification_tools = NotificationTools()
    
    def evaluate_rule(self, rule: TradingRule, user_email: str, user_phone: Optional[str] = None) -> Dict[str, Any]:
        """
        Evaluate a single trading rule and execute actions if triggered.
        
        Args:
            rule: TradingRule to evaluate
            user_email: User email for notifications
            user_phone: User phone for SMS notifications
        
        Returns:
            Dictionary with evaluation results
        """
        try:
            # Fetch current market data
            market_data = self._fetch_market_data(rule.asset, rule.asset_type)
            
            if not market_data:
                return {"triggered": False, "error": "Unable to fetch market data"}
            
            # Evaluate rule condition
            triggered = self._evaluate_condition(rule, market_data)
            
            if not triggered:
                return {"triggered": False, "market_data": market_data}
            
            logger.info(f"Rule {rule.id} triggered for {rule.asset}")
            
            # Execute actions
            action_results = []
            for action in rule.actions:
                result = self._execute_action(action, rule, market_data, user_email, user_phone)
                action_results.append(result)
            
            # Update last triggered time
            self._update_rule_timestamp(rule.id)
            
            return {
                "triggered": True,
                "market_data": market_data,
                "actions": action_results
            }
        
        except Exception as e:
            logger.error(f"Error evaluating rule {rule.id}: {e}")
            return {"triggered": False, "error": str(e)}
    
    def _fetch_market_data(self, symbol: str, asset_type: str) -> Optional[Dict[str, Any]]:
        """Fetch current market data for an asset"""
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period="1d")
            
            if history.empty:
                return None
            
            current_price = history['Close'].iloc[-1]
            volume = history['Volume'].iloc[-1]
            
            # Calculate momentum (simplified)
            history_week = ticker.history(period="5d")
            momentum = 0
            if len(history_week) > 1:
                momentum = ((current_price - history_week['Close'].iloc[0]) / 
                          history_week['Close'].iloc[0]) * 100
            
            return {
                "symbol": symbol,
                "price": float(current_price),
                "volume": int(volume),
                "momentum": float(momentum),
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return None
    
    def _evaluate_condition(self, rule: TradingRule, market_data: Dict[str, Any]) -> bool:
        """Evaluate if rule condition is met"""
        try:
            condition = rule.condition
            price = market_data["price"]
            momentum = market_data.get("momentum", 0)
            volume = market_data.get("volume", 0)
            
            if rule.rule_type == RuleType.PRICE_ABOVE:
                threshold = condition.get("threshold", 0)
                return price > threshold
            
            elif rule.rule_type == RuleType.PRICE_BELOW:
                threshold = condition.get("threshold", 0)
                return price < threshold
            
            elif rule.rule_type == RuleType.MOMENTUM_POSITIVE:
                threshold = condition.get("threshold", 0)
                return momentum > threshold
            
            elif rule.rule_type == RuleType.MOMENTUM_NEGATIVE:
                threshold = condition.get("threshold", 0)
                return momentum < threshold
            
            elif rule.rule_type == RuleType.VOLUME_SPIKE:
                multiplier = condition.get("multiplier", 2.0)
                avg_volume = condition.get("avg_volume", volume)
                return volume > (avg_volume * multiplier)
            
            elif rule.rule_type == RuleType.CUSTOM_CONDITION:
                # Custom Python expression evaluation (use with caution!)
                expression = condition.get("expression", "False")
                context = {
                    "price": price,
                    "momentum": momentum,
                    "volume": volume
                }
                return eval(expression, {"__builtins__": {}}, context)
            
            return False
        
        except Exception as e:
            logger.error(f"Error evaluating condition: {e}")
            return False
    
    def _execute_action(
        self, 
        action: ActionType, 
        rule: TradingRule, 
        market_data: Dict[str, Any],
        user_email: str,
        user_phone: Optional[str]
    ) -> Dict[str, Any]:
        """Execute a specific action"""
        try:
            if action == ActionType.NOTIFY_EMAIL:
                subject = f"Trading Alert: {rule.name}"
                message = self._format_alert_message(rule, market_data)
                result = self.notification_tools.send_email_alert(user_email, subject, message)
                return {"action": "email", "status": "success", "message": result}
            
            elif action == ActionType.NOTIFY_SMS:
                if user_phone:
                    message = f"Alert: {rule.asset} at ₹{market_data['price']:.2f}"
                    result = self.notification_tools.send_sms_alert(user_phone, message)
                    return {"action": "sms", "status": "success", "message": result}
                return {"action": "sms", "status": "skipped", "message": "No phone number"}
            
            elif action == ActionType.BUY_TRIGGER or action == ActionType.SELL_TRIGGER:
                # Log trade execution (in production, integrate with broker API)
                trade_action = "buy" if action == ActionType.BUY_TRIGGER else "sell"
                trade_id = self._log_trade_execution(
                    rule.user_id,
                    rule.id,
                    rule.asset,
                    trade_action,
                    market_data["price"]
                )
                return {
                    "action": trade_action,
                    "status": "simulated",
                    "trade_id": trade_id,
                    "price": market_data["price"]
                }
            
            elif action == ActionType.GENERATE_REPORT:
                report = self._generate_report(rule, market_data)
                subject = f"Market Report: {rule.asset}"
                self.notification_tools.send_email_alert(user_email, subject, report)
                return {"action": "report", "status": "success"}
            
            return {"action": str(action), "status": "unknown"}
        
        except Exception as e:
            logger.error(f"Error executing action {action}: {e}")
            return {"action": str(action), "status": "error", "message": str(e)}
    
    def _format_alert_message(self, rule: TradingRule, market_data: Dict[str, Any]) -> str:
        """Format alert message for notifications"""
        return f"""
<html>
<body>
    <h2>Trading Alert Triggered</h2>
    <p><strong>Rule:</strong> {rule.name}</p>
    <p><strong>Asset:</strong> {rule.asset}</p>
    <p><strong>Current Price:</strong> ₹{market_data['price']:.2f}</p>
    <p><strong>Momentum:</strong> {market_data.get('momentum', 0):+.2f}%</p>
    <p><strong>Volume:</strong> {market_data.get('volume', 0):,}</p>
    <p><strong>Time:</strong> {market_data['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <p><em>This is an automated alert from your personal trading agent.</em></p>
</body>
</html>
"""
    
    def _generate_report(self, rule: TradingRule, market_data: Dict[str, Any]) -> str:
        """Generate detailed market report"""
        return f"""
<html>
<body>
    <h2>Market Analysis Report</h2>
    <h3>{rule.asset}</h3>
    
    <h4>Current Market Status</h4>
    <ul>
        <li>Price: ₹{market_data['price']:.2f}</li>
        <li>Momentum: {market_data.get('momentum', 0):+.2f}%</li>
        <li>Volume: {market_data.get('volume', 0):,}</li>
    </ul>
    
    <h4>Rule Details</h4>
    <ul>
        <li>Rule: {rule.name}</li>
        <li>Type: {rule.rule_type}</li>
        <li>Condition: {rule.condition}</li>
    </ul>
    
    <p><em>Report generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</em></p>
</body>
</html>
"""
    
    def _log_trade_execution(
        self, 
        user_id: str, 
        rule_id: str, 
        asset: str, 
        action: str, 
        price: float
    ) -> str:
        """Log trade execution to database"""
        try:
            session = get_session()
            trade = TradeExecutionDB(
                id=f"trade_{datetime.now().timestamp()}",
                user_id=user_id,
                agent_id=f"agent_{user_id}",
                rule_id=rule_id,
                asset=asset,
                action=action,
                quantity=1.0,  # Default quantity
                price=price,
                status="simulated",
                created_at=datetime.now()
            )
            session.add(trade)
            session.commit()
            trade_id = trade.id
            session.close()
            return trade_id
        except Exception as e:
            logger.error(f"Error logging trade: {e}")
            return f"trade_error_{datetime.now().timestamp()}"
    
    def _update_rule_timestamp(self, rule_id: str):
        """Update last triggered timestamp for a rule"""
        try:
            session = get_session()
            rule = session.query(TradingRuleDB).filter_by(id=rule_id).first()
            if rule:
                rule.last_triggered = datetime.now()
                session.commit()
            session.close()
        except Exception as e:
            logger.error(f"Error updating rule timestamp: {e}")
