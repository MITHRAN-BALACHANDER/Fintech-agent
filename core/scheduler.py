"""
Background Task Scheduler for FinSIght Platform
Handles scheduled portfolio monitoring, rule checks, and timed notifications
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable, Any
from sqlalchemy import Engine
from core.database import get_session, UserDB, TradingRuleDB, WatchlistDB
from tools.market_tools import MarketDataTools
from tools.notification_tools import NotificationTools
from agno.utils.log import logger
import traceback
import pytz
import yfinance as yf


class ScheduledTask:
    """Represents a scheduled task"""
    def __init__(self, task_id: str, user_id: str, task_type: str, 
                 scheduled_time: datetime, params: Dict[str, Any]):
        self.task_id = task_id
        self.user_id = user_id
        self.task_type = task_type
        self.scheduled_time = scheduled_time
        self.params = params
        self.status = "pending"
        self.created_at = datetime.now()


class TaskScheduler:
    """
    Production-grade task scheduler for background operations
    Enables timed analysis, portfolio monitoring, and scheduled notifications
    """
    
    def __init__(self, db_engine: Engine):
        """Initialize the task scheduler"""
        self.db_engine = db_engine
        self.scheduler = BackgroundScheduler(timezone=pytz.UTC)
        self.tasks: Dict[str, ScheduledTask] = {}
        self.market_tools = MarketDataTools()
        
        logger.info("Task Scheduler initialized")
    
    def start(self):
        """Start the background scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            
            # Add continuous rule monitoring (every 5 minutes during market hours)
            self.scheduler.add_job(
                self._monitor_all_rules,
                IntervalTrigger(minutes=5),
                id="rule_monitor",
                name="Monitor Trading Rules",
                replace_existing=True
            )
            
            # Add daily portfolio summary (9 AM IST = 3:30 AM UTC)
            self.scheduler.add_job(
                self._send_daily_summaries,
                CronTrigger(hour=3, minute=30),
                id="daily_summary",
                name="Daily Portfolio Summary",
                replace_existing=True
            )
            
            logger.info("Task Scheduler started")
    
    def stop(self):
        """Stop the background scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Task Scheduler stopped")
    
    def schedule_portfolio_analysis(self, user_id: str, scheduled_time: datetime, 
                                   watchlist_names: Optional[List[str]] = None,
                                   compare_from: Optional[datetime] = None) -> str:
        """
        Schedule a portfolio analysis at a specific time
        
        Args:
            user_id: User ID
            scheduled_time: When to run the analysis
            watchlist_names: Specific watchlists to analyze (None = all)
            compare_from: Compare prices from this time (for change tracking)
        
        Returns:
            task_id: Unique task identifier
        """
        task_id = f"portfolio_analysis_{user_id}_{int(scheduled_time.timestamp())}"
        
        task = ScheduledTask(
            task_id=task_id,
            user_id=user_id,
            task_type="portfolio_analysis",
            scheduled_time=scheduled_time,
            params={
                "watchlist_names": watchlist_names,
                "compare_from": compare_from
            }
        )
        
        self.tasks[task_id] = task
        
        # Schedule the job
        self.scheduler.add_job(
            self._run_portfolio_analysis,
            DateTrigger(run_date=scheduled_time),
            args=[task_id],
            id=task_id,
            name=f"Portfolio Analysis for {user_id}",
            replace_existing=True
        )
        
        logger.info(f"Scheduled portfolio analysis for {user_id} at {scheduled_time}")
        return task_id
    
    def schedule_recurring_analysis(self, user_id: str, interval_minutes: int,
                                   watchlist_names: Optional[List[str]] = None,
                                   start_time: Optional[datetime] = None,
                                   end_time: Optional[datetime] = None) -> str:
        """
        Schedule recurring portfolio analysis
        
        Args:
            user_id: User ID
            interval_minutes: Analysis interval (e.g., 30 for every 30 minutes)
            watchlist_names: Specific watchlists to analyze
            start_time: When to start (default: now)
            end_time: When to stop (default: end of day)
        
        Returns:
            task_id: Unique task identifier
        """
        task_id = f"recurring_analysis_{user_id}_{int(datetime.now().timestamp())}"
        
        start = start_time or datetime.now()
        end = end_time or (datetime.now().replace(hour=23, minute=59))
        
        task = ScheduledTask(
            task_id=task_id,
            user_id=user_id,
            task_type="recurring_analysis",
            scheduled_time=start,
            params={
                "interval_minutes": interval_minutes,
                "watchlist_names": watchlist_names,
                "end_time": end,
                "baseline_prices": {}  # Store initial prices for comparison
            }
        )
        
        self.tasks[task_id] = task
        
        # Schedule recurring job with end time
        self.scheduler.add_job(
            self._run_recurring_analysis,
            IntervalTrigger(minutes=interval_minutes, start_date=start, end_date=end),
            args=[task_id],
            id=task_id,
            name=f"Recurring Analysis for {user_id}",
            replace_existing=True
        )
        
        logger.info(f"Scheduled recurring analysis for {user_id}: every {interval_minutes} min until {end}")
        return task_id
    
    def schedule_price_monitoring(self, user_id: str, assets: List[str], 
                                 duration_minutes: int, report_at_end: bool = True) -> str:
        """
        Monitor asset prices for a duration and send report
        
        Args:
            user_id: User ID
            assets: List of assets to monitor (e.g., ["TCS.NS", "AAPL"])
            duration_minutes: How long to monitor
            report_at_end: Whether to send a report when done
        
        Returns:
            task_id: Unique task identifier
        """
        task_id = f"price_monitor_{user_id}_{int(datetime.now().timestamp())}"
        
        start_time = datetime.now()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Capture baseline prices
        baseline_prices = {}
        for asset in assets:
            try:
                ticker = yf.Ticker(asset)
                history = ticker.history(period="1d")
                if not history.empty:
                    baseline_prices[asset] = {
                        "start_price": float(history['Close'].iloc[-1]),
                        "start_time": start_time.isoformat()
                    }
            except Exception as e:
                logger.error(f"Failed to get baseline price for {asset}: {e}")
                logger.error(traceback.format_exc())
        
        task = ScheduledTask(
            task_id=task_id,
            user_id=user_id,
            task_type="price_monitoring",
            scheduled_time=end_time,
            params={
                "assets": assets,
                "baseline_prices": baseline_prices,
                "duration_minutes": duration_minutes,
                "start_time": start_time
            }
        )
        
        self.tasks[task_id] = task
        
        if report_at_end:
            # Schedule report at end time
            self.scheduler.add_job(
                self._send_monitoring_report,
                DateTrigger(run_date=end_time),
                args=[task_id],
                id=task_id,
                name=f"Price Monitoring Report for {user_id}",
                replace_existing=True
            )
        
        logger.info(f"Scheduled price monitoring for {user_id}: {assets} until {end_time}")
        return task_id
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a scheduled task"""
        try:
            self.scheduler.remove_job(task_id)
            if task_id in self.tasks:
                self.tasks[task_id].status = "cancelled"
            logger.info(f"Cancelled task: {task_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel task {task_id}: {e}")
            return False
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a scheduled task"""
        if task_id not in self.tasks:
            return None
        
        task = self.tasks[task_id]
        return {
            "task_id": task.task_id,
            "user_id": task.user_id,
            "task_type": task.task_type,
            "scheduled_time": task.scheduled_time.isoformat(),
            "status": task.status,
            "created_at": task.created_at.isoformat(),
            "params": task.params
        }
    
    def list_user_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """List all tasks for a user"""
        user_tasks = [
            self.get_task_status(task_id)
            for task_id, task in self.tasks.items()
            if task.user_id == user_id and task.status != "completed"
        ]
        return user_tasks
    
    # Internal task execution methods
    
    def _run_portfolio_analysis(self, task_id: str):
        """Execute scheduled portfolio analysis"""
        try:
            if task_id not in self.tasks:
                logger.error(f"Task not found: {task_id}")
                return
            
            task = self.tasks[task_id]
            task.status = "running"
            
            logger.info(f"Running portfolio analysis: {task_id}")
            
            # Get user and watchlists
            session = get_session(self.db_engine)
            user = session.query(UserDB).filter_by(id=task.user_id).first()
            
            if not user:
                logger.error(f"User not found: {task.user_id}")
                session.close()
                return
            
            # Get watchlists
            watchlist_query = session.query(WatchlistDB).filter_by(user_id=user.id)
            if task.params.get("watchlist_names"):
                watchlist_query = watchlist_query.filter(
                    WatchlistDB.name.in_(task.params["watchlist_names"])
                )
            
            watchlists = watchlist_query.all()
            
            # Analyze each watchlist
            analysis_data = []
            for wl in watchlists:
                wl_analysis = {
                    "name": wl.name,
                    "assets": []
                }
                
                for asset in wl.assets:
                    try:
                        # Get current data using yfinance
                        ticker = yf.Ticker(asset)
                        history = ticker.history(period="1d")
                        
                        if history.empty:
                            logger.warning(f"No data available for {asset}")
                            continue
                        
                        current_price = float(history['Close'].iloc[-1])
                        info = ticker.info
                        previous_close = info.get('previousClose', current_price)
                        change = current_price - previous_close
                        change_percent = (change / previous_close) * 100 if previous_close else 0
                        
                        # Get technical indicators
                        try:
                            technical_str = self.market_tools.get_technical_indicators(asset)
                            # Parse technical indicators (returns string, we need to extract trend/recommendation)
                            trend = "Bullish" if "BULLISH" in technical_str or change_percent > 0 else "Bearish" if change_percent < 0 else "Neutral"
                            recommendation = "Buy" if change_percent > 2 else "Sell" if change_percent < -2 else "Hold"
                        except:
                            trend = "Neutral"
                            recommendation = "Hold"
                        
                        asset_info = {
                            "symbol": asset,
                            "price": f"${current_price:.2f}",
                            "change_percent": f"{change_percent:+.2f}%",
                            "trend": trend,
                            "recommendation": recommendation
                        }
                        
                        wl_analysis["assets"].append(asset_info)
                    except Exception as e:
                        logger.error(f"Failed to analyze {asset}: {e}")
                        logger.error(traceback.format_exc())
                
                analysis_data.append(wl_analysis)
            
            # Send email with results
            notifier = NotificationTools(
                user_email=user.email,
                user_phone=user.phone,
                user_name=user.name
            )
            
            notifier.send_formatted_email(
                email_type="watchlist_analysis",
                subject=f"Scheduled Portfolio Analysis - {datetime.now().strftime('%I:%M %p')}",
                data={"watchlists": analysis_data}
            )
            
            task.status = "completed"
            session.close()
            
            logger.info(f"Completed portfolio analysis: {task_id}")
            
        except Exception as e:
            logger.error(f"Error in portfolio analysis {task_id}: {e}")
            logger.error(traceback.format_exc())
            if task_id in self.tasks:
                self.tasks[task_id].status = "failed"
    
    def _run_recurring_analysis(self, task_id: str):
        """Execute recurring portfolio analysis"""
        try:
            if task_id not in self.tasks:
                return
            
            task = self.tasks[task_id]
            
            # Check if we should still run
            if datetime.now() > task.params["end_time"]:
                self.cancel_task(task_id)
                return
            
            # Capture baseline on first run
            if not task.params.get("baseline_prices"):
                session = get_session(self.db_engine)
                watchlist_query = session.query(WatchlistDB).filter_by(user_id=task.user_id)
                if task.params.get("watchlist_names"):
                    watchlist_query = watchlist_query.filter(
                        WatchlistDB.name.in_(task.params["watchlist_names"])
                    )
                
                watchlists = watchlist_query.all()
                baseline = {}
                
                for wl in watchlists:
                    for asset in wl.assets:
                        try:
                            ticker = yf.Ticker(asset)
                            history = ticker.history(period="1d")
                            if not history.empty:
                                baseline[asset] = float(history['Close'].iloc[-1])
                        except Exception as e:
                            logger.error(f"Failed to get baseline for {asset}: {e}")
                            pass
                
                task.params["baseline_prices"] = baseline
                session.close()
            
            # Run analysis
            self._run_portfolio_analysis(task_id)
            task.status = "pending"  # Reset for next run
            
        except Exception as e:
            logger.error(f"Error in recurring analysis {task_id}: {e}")
    
    def _send_monitoring_report(self, task_id: str):
        """Send price monitoring report"""
        try:
            if task_id not in self.tasks:
                return
            
            task = self.tasks[task_id]
            task.status = "running"
            
            logger.info(f"Sending monitoring report: {task_id}")
            
            # Get user
            session = get_session(self.db_engine)
            user = session.query(UserDB).filter_by(id=task.user_id).first()
            
            if not user:
                session.close()
                return
            
            # Compare current prices with baseline
            baseline = task.params["baseline_prices"]
            current_data = []
            
            for asset, baseline_info in baseline.items():
                try:
                    # Get current price using yfinance
                    ticker = yf.Ticker(asset)
                    history = ticker.history(period="1d")
                    
                    if history.empty:
                        logger.warning(f"No data available for {asset}")
                        continue
                    
                    current_price = float(history['Close'].iloc[-1])
                    start_price = baseline_info["start_price"]
                    
                    change = current_price - start_price
                    change_pct = (change / start_price * 100) if start_price > 0 else 0
                    
                    current_data.append({
                        "symbol": asset,
                        "start_price": f"${start_price:.2f}",
                        "current_price": f"${current_price:.2f}",
                        "change": f"${change:+.2f}",
                        "change_percent": f"{change_pct:+.2f}%",
                        "trend": "Up" if change > 0 else "Down" if change < 0 else "Flat"
                    })
                except Exception as e:
                    logger.error(f"Failed to get current price for {asset}: {e}")
                    logger.error(traceback.format_exc())
            
            # Send email
            notifier = NotificationTools(
                user_email=user.email,
                user_phone=user.phone,
                user_name=user.name
            )
            
            duration = task.params["duration_minutes"]
            start_time = task.params["start_time"].strftime("%I:%M %p")
            end_time = datetime.now().strftime("%I:%M %p")
            
            message = f"""
            <h2>Price Monitoring Report</h2>
            <p><strong>Period:</strong> {start_time} to {end_time} ({duration} minutes)</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Asset</th>
                        <th style="padding: 10px; text-align: right;">Start Price</th>
                        <th style="padding: 10px; text-align: right;">Current Price</th>
                        <th style="padding: 10px; text-align: right;">Change</th>
                    </tr>
                </thead>
                <tbody>
            """
            
            for data in current_data:
                color = "green" if "+" in data["change"] else "red" if "-" in data["change"] else "gray"
                message += f"""
                <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px;"><strong>{data['symbol']}</strong></td>
                    <td style="padding: 10px; text-align: right;">{data['start_price']}</td>
                    <td style="padding: 10px; text-align: right;">{data['current_price']}</td>
                    <td style="padding: 10px; text-align: right; color: {color}; font-weight: bold;">
                        {data['change']} ({data['change_percent']})
                    </td>
                </tr>
                """
            
            message += "</tbody></table>"
            
            notifier.send_formatted_email(
                email_type="generic",
                subject=f"Price Monitoring Report - {end_time}",
                data={
                    "title": "Price Monitoring Complete",
                    "message": message
                }
            )
            
            task.status = "completed"
            session.close()
            
            logger.info(f"Sent monitoring report: {task_id}")
            
        except Exception as e:
            logger.error(f"Error sending monitoring report {task_id}: {e}")
            logger.error(traceback.format_exc())
    
    def _monitor_all_rules(self):
        """Background job to monitor all active trading rules"""
        try:
            session = get_session(self.db_engine)
            active_rules = session.query(TradingRuleDB).filter_by(enabled=True).all()
            
            for rule in active_rules:
                try:
                    # Get user
                    user = session.query(UserDB).filter_by(id=rule.user_id).first()
                    if not user:
                        continue
                    
                    # Get current price using yfinance directly
                    ticker = yf.Ticker(rule.asset)
                    history = ticker.history(period="1d")
                    
                    if history.empty:
                        logger.warning(f"No data available for {rule.asset}")
                        continue
                    
                    current_price = float(history['Close'].iloc[-1])
                    previous_close = ticker.info.get('previousClose', current_price)
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close else 0
                    
                    triggered = False
                    
                    if rule.rule_type == "price_above":
                        threshold = rule.condition.get("threshold", 0)
                        if current_price > threshold:
                            triggered = True
                    elif rule.rule_type == "price_below":
                        threshold = rule.condition.get("threshold", 0)
                        if current_price < threshold:
                            triggered = True
                    
                    if triggered:
                        # Send notification
                        notifier = NotificationTools(
                            user_email=user.email,
                            user_phone=user.phone,
                            user_name=user.name
                        )
                        
                        notifier.send_formatted_email(
                            email_type="rule_triggered",
                            subject=f"Rule Triggered: {rule.name}",
                            data={
                                "rule_name": rule.name,
                                "asset": rule.asset,
                                "trigger_reason": f"Price {rule.rule_type.replace('_', ' ')} ${threshold:.2f}",
                                "current_data": {
                                    "current_price": current_price,
                                    "change": change,
                                    "change_percent": change_percent,
                                    "symbol": rule.asset
                                }
                            }
                        )
                        
                        # Update last triggered
                        rule.last_triggered = datetime.now()
                        session.commit()
                        
                        logger.info(f"Rule triggered: {rule.name} for user {user.email} (Price: ${current_price:.2f})")
                
                except Exception as e:
                    logger.error(f"Error checking rule {rule.id}: {e}")
                    logger.error(traceback.format_exc())
                    continue
            
            session.close()
            
        except Exception as e:
            logger.error(f"Error in rule monitoring: {e}")
            logger.error(traceback.format_exc())
    
    def _send_daily_summaries(self):
        """Send daily portfolio summaries to all users"""
        try:
            session = get_session(self.db_engine)
            users = session.query(UserDB).all()
            
            for user in users:
                try:
                    # Schedule analysis for this user
                    self.schedule_portfolio_analysis(
                        user_id=user.id,
                        scheduled_time=datetime.now() + timedelta(seconds=10)
                    )
                except Exception as e:
                    logger.error(f"Failed to schedule daily summary for {user.email}: {e}")
            
            session.close()
            
        except Exception as e:
            logger.error(f"Error sending daily summaries: {e}")
