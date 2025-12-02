"""
Agent factory for creating personalized trading agents
Each user gets a customized AGNO agent with their specific rules and preferences
"""
from agno.agent import Agent
from agno.models.google import Gemini
from agno.models.openai import OpenAIChat
from agno.db.sqlite import SqliteDb
from typing import Dict, List, Optional
from textwrap import dedent
from sqlalchemy import Engine
from core.models import User, TradingRule, Watchlist, AgentConfig
from tools.market_tools import MarketDataTools
from tools.notification_tools import NotificationTools
from tools.watchlist_tools import WatchlistTools
from tools.rules_tools import RulesTools
from agno.utils.log import logger
import os


class AgentFactory:
    """Factory for creating and managing personalized trading agents"""
    
    def __init__(self, db_engine: Optional[Engine] = None, model_provider: str = "gemini", db_path: str = "./agents.db"):
        """
        Initialize agent factory.
        
        Args:
            db_engine: SQLAlchemy database engine for watchlist/rules access
            model_provider: AI model provider (gemini, openai)
            db_path: Path to SQLite database for agent storage
        """
        self.db_engine = db_engine
        self.model_provider = model_provider
        self.db_path = db_path
        self.agents: Dict[str, Agent] = {}
    
    def create_agent(self, config: AgentConfig) -> Agent:
        """
        Create a personalized trading agent for a user.
        
        Args:
            config: Agent configuration with user rules and preferences
        
        Returns:
            Configured AGNO Agent instance
        """
        try:
            # Generate personalized instructions
            instructions = self._generate_instructions(config)
            
            # Select model
            model = self._get_model(config.preferences.get("model_id"))
            
            # Get user email and phone from preferences
            user_email = config.preferences.get("email")
            user_phone = config.preferences.get("phone")
            
            # Initialize tools with user contact information and database access
            tools = [
                MarketDataTools(),
                NotificationTools(user_email=user_email, user_phone=user_phone),
                WatchlistTools(user_id=config.user_id, db_engine=self.db_engine),
                RulesTools(user_id=config.user_id, db_engine=self.db_engine)
            ]
            
            # Create database for agent memory
            agent_db = SqliteDb(
                db_file=self.db_path
            )
            
            # Create agent
            agent = Agent(
                name=config.agent_name,
                model=model,
                instructions=instructions,
                tools=tools,
                markdown=True,
                db=agent_db,
                description=config.description
            )
            
            # Store agent reference
            self.agents[config.user_id] = agent
            
            logger.info(f"Created agent for user {config.user_id}: {config.agent_name}")
            return agent
        
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            raise
    
    def _generate_instructions(self, config: AgentConfig) -> str:
        """Generate personalized instructions for the agent"""
        
        # Build watchlist summary
        watchlist_summary = ""
        if config.watchlists:
            watchlist_summary = "\n\nYour Watchlists:\n"
            for wl in config.watchlists:
                watchlist_summary += f"- {wl.name} ({wl.asset_type}): {', '.join(wl.assets)}\n"
        
        # Build rules summary
        rules_summary = ""
        if config.rules:
            rules_summary = "\n\nActive Trading Rules:\n"
            for rule in config.rules:
                if rule.enabled:
                    rules_summary += f"- {rule.name}: {rule.description or rule.rule_type}\n"
        
        # Risk profile guidance
        risk_guidance = {
            "conservative": "Focus on stable, low-risk investments. Prioritize capital preservation.",
            "moderate": "Balance between growth and safety. Consider both value and growth stocks.",
            "aggressive": "Seek high-growth opportunities. Willing to accept higher volatility."
        }
        
        risk_profile = config.preferences.get("risk_profile", "moderate")
        risk_text = risk_guidance.get(risk_profile, risk_guidance["moderate"])
        
        user_email = config.preferences.get("email", "Not provided")
        user_phone = config.preferences.get("phone", "Not provided")
        
        instructions = dedent(f"""\
            You are a highly sophisticated personal trading assistant powered by AI. 
            You work exclusively for this user and understand their investment goals, risk tolerance, and trading preferences.
            
            **User Profile:**
            - Risk Profile: {risk_profile.upper()} - {risk_text}
            - Investment Style: {config.preferences.get('investment_style', 'Long-term growth')}
            - Email: {user_email}
            - Phone: {user_phone}
            
            {watchlist_summary}
            {rules_summary}
            
            **Your Capabilities:**
            1. **Market Analysis**: You can fetch real-time stock and cryptocurrency prices, analyze technical indicators, 
               and assess market sentiment using news and data.
            
            2. **Watchlist Management**: You can create, view, and manage watchlists for the user.
               - Create watchlists: create_watchlist(name, assets, asset_type)
               - Add to watchlist: add_to_watchlist(watchlist_name, symbols)
               - View watchlists: get_watchlists()
               - When user asks to "add TCS to my watchlist" or "track INFY", use these tools
               - For Indian stocks, use .NS suffix (e.g., "TCS.NS", "INFY.NS")
            
            3. **Rules Management**: You can view and manage the user's trading rules.
               - View all rules: get_rules() or summarize_rules()
               - View specific rule: get_rule_by_id(rule_id)
               - View rules for asset: get_rules_by_asset(asset)
               - Enable/disable rules: update_rule_status(rule_id, enabled)
               - View recent triggers: get_recently_triggered_rules()
               - When user asks "check my rules" or "show my rules", use summarize_rules()
               - When user asks to enable/disable a rule, use update_rule_status()
            
            4. **Rule Monitoring**: You continuously monitor trading rules set by the user. When conditions are met, 
               you trigger alerts via email, SMS, or execute automated actions.
            
            5. **Intelligent Recommendations**: Based on market data, momentum, technical indicators, and macroeconomic trends, 
               you provide buy/sell recommendations aligned with the user's risk profile.
            
            6. **Report Generation**: You can generate detailed market reports, portfolio analysis, and performance summaries.
            
            **Email/SMS Notifications:**
            - The user's email and phone are already configured in your notification tools
            - DO NOT ask the user for their email or phone number - they are already set up
            - When sending notifications, simply call send_email_alert(subject, message) or send_sms_alert(message) 
              WITHOUT providing email/phone parameters - they will automatically use the registered contact info
            - You can send notifications proactively when you detect important market movements or rule triggers
            
            **Guidelines:**
            - Always verify information using your market data tools before making recommendations
            - Explain your reasoning clearly, citing specific data points (price, momentum, volume, etc.)
            - Respect the user's risk profile and investment preferences
            - When rules trigger, execute actions promptly and notify the user
            - Be proactive: if you notice significant market movements in watchlist assets, alert the user
            - Provide context: explain WHY a stock is moving, not just WHAT is happening
            - Use emojis sparingly for readability: 📈 (bullish), 📉 (bearish), ⚠️ (warning), ✅ (good signal)
            
            **Important Notes:**
            - All trade executions are currently SIMULATED for safety
            - Always disclose when you're providing opinions vs factual data
            - If unsure about something, say so and suggest how to verify
            
            Remember: You are this user's trusted financial co-pilot. Be helpful, accurate, and proactive!
        """)
        
        return instructions
    
    def _get_model(self, model_id: Optional[str] = None):
        """Get AI model instance with fallback support"""
        # Get API keys from environment
        google_api_key = os.getenv("GOOGLE_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if model_id:
            if "gpt" in model_id.lower():
                if not openai_api_key:
                    logger.warning("OpenAI API key not found, falling back to Gemini")
                    return Gemini(id="gemini-flash-latest", api_key=google_api_key)
                return OpenAIChat(id=model_id)
            else:
                return Gemini(id=model_id, api_key=google_api_key)
        
        # Default models with fallback chain
        if self.model_provider == "openai" and openai_api_key:
            return OpenAIChat(id="gpt-4o-mini")
        elif google_api_key:
            # Use stable gemini-flash-latest instead of experimental model
            return Gemini(id="gemini-flash-latest", api_key=google_api_key)
        else:
            raise ValueError("No API keys configured. Please set GOOGLE_API_KEY or OPENAI_API_KEY")
    
    def get_agent(self, user_id: str) -> Optional[Agent]:
        """Get existing agent for a user"""
        return self.agents.get(user_id)
    
    def update_agent(self, user_id: str, config: AgentConfig) -> Agent:
        """Update an existing agent with new configuration"""
        # For now, recreate the agent
        # In production, you'd want to update instructions dynamically
        return self.create_agent(config)
    
    def remove_agent(self, user_id: str):
        """Remove an agent from memory"""
        if user_id in self.agents:
            del self.agents[user_id]
            logger.info(f"Removed agent for user {user_id}")
