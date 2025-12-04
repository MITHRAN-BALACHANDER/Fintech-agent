"""
Scheduler Tools for Agent
Allows AI agent to schedule future tasks and monitoring
"""
from agno.tools import Toolkit
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime, timedelta
from agno.utils.log import logger

if TYPE_CHECKING:
    from core.scheduler import TaskScheduler


class SchedulerTools(Toolkit):
    """Tools for scheduling background tasks and monitoring"""
    
    def __init__(self, user_id: str, scheduler: Optional['TaskScheduler'] = None):
        super().__init__(name="scheduler_tools")
        self.user_id = user_id
        self.scheduler = scheduler
        
        # Register all tool methods
        self.register(self.schedule_analysis_at_time)
        self.register(self.schedule_monitoring_until)
        self.register(self.schedule_recurring_analysis)
        self.register(self.list_scheduled_tasks)
        self.register(self.cancel_task)
    
    def schedule_analysis_at_time(self, time_str: str, watchlist_names: Optional[List[str]] = None) -> dict:
        """
        Schedule portfolio analysis at a specific time.
        
        Args:
            time_str: Time in format "HH:MM" (24-hour) or "HH:MM AM/PM" (e.g., "3:30 PM", "15:30")
            watchlist_names: Optional list of specific watchlists to analyze
        
        Returns:
            dict: Task details including task_id
        
        Example:
            schedule_analysis_at_time("3:30 PM")
            schedule_analysis_at_time("15:30", ["Tech Stocks", "Crypto"])
        """
        if not self.scheduler:
            return {"success": False, "error": "Scheduler not available"}
        
        try:
            # Parse time string
            scheduled_time = self._parse_time_str(time_str)
            
            task_id = self.scheduler.schedule_portfolio_analysis(
                user_id=self.user_id,
                scheduled_time=scheduled_time,
                watchlist_names=watchlist_names
            )
            
            logger.info(f"Scheduled analysis for {time_str}: {task_id}")
            return {
                "success": True,
                "task_id": task_id,
                "scheduled_time": scheduled_time.isoformat(),
                "message": f"Portfolio analysis scheduled for {scheduled_time.strftime('%I:%M %p')}"
            }
        
        except Exception as e:
            logger.error(f"Error scheduling analysis: {e}")
            return {"success": False, "error": str(e)}
    
    def schedule_monitoring_until(self, end_time_str: str, assets: List[str]) -> dict:
        """
        Monitor asset prices until a specific time and send report.
        
        Args:
            end_time_str: End time in format "HH:MM" or "HH:MM AM/PM" (e.g., "3:30 PM")
            assets: List of asset symbols to monitor (e.g., ["TCS.NS", "AAPL"])
        
        Returns:
            dict: Monitoring task details
        
        Example:
            schedule_monitoring_until("3:30 PM", ["TCS.NS", "AAPL"])
        """
        if not self.scheduler:
            return {"success": False, "error": "Scheduler not available"}
        
        try:
            # Calculate duration from now until end_time
            end_time = self._parse_time_str(end_time_str)
            now = datetime.now()
            duration_minutes = int((end_time - now).total_seconds() / 60)
            
            if duration_minutes <= 0:
                return {
                    "success": False,
                    "error": "End time must be in the future"
                }
            
            task_id = self.scheduler.schedule_price_monitoring(
                user_id=self.user_id,
                assets=assets,
                duration_minutes=duration_minutes,
                report_at_end=True
            )
            
            logger.info(f"Started monitoring {assets} until {end_time_str}")
            return {
                "success": True,
                "task_id": task_id,
                "duration_minutes": duration_minutes,
                "assets": assets,
                "message": f"Monitoring {len(assets)} assets for {duration_minutes} minutes"
            }
        
        except Exception as e:
            logger.error(f"Error starting monitoring: {e}")
            return {"success": False, "error": str(e)}
    
    def schedule_recurring_analysis(self, interval_minutes: int, 
                                   until_time_str: str,
                                   watchlist_names: Optional[List[str]] = None) -> dict:
        """
        Schedule recurring portfolio analysis at regular intervals.
        
        Args:
            interval_minutes: How often to analyze (e.g., 30 for every 30 minutes)
            until_time_str: When to stop in format "HH:MM" or "HH:MM AM/PM"
            watchlist_names: Optional list of specific watchlists
        
        Returns:
            dict: Recurring task details
        
        Example:
            schedule_recurring_analysis(30, "5:00 PM", ["Tech Stocks"])
        """
        if not self.scheduler:
            return {"success": False, "error": "Scheduler not available"}
        
        try:
            end_time = self._parse_time_str(until_time_str)
            
            task_id = self.scheduler.schedule_recurring_analysis(
                user_id=self.user_id,
                interval_minutes=interval_minutes,
                watchlist_names=watchlist_names,
                start_time=datetime.now(),
                end_time=end_time
            )
            
            logger.info(f"Scheduled recurring analysis every {interval_minutes} min until {until_time_str}")
            return {
                "success": True,
                "task_id": task_id,
                "interval_minutes": interval_minutes,
                "message": f"Recurring analysis scheduled every {interval_minutes} minutes"
            }
        
        except Exception as e:
            logger.error(f"Error scheduling recurring analysis: {e}")
            return {"success": False, "error": str(e)}
    
    def list_scheduled_tasks(self) -> dict:
        """
        List all active scheduled tasks for the user.
        
        Returns:
            dict: List of active tasks with status
        
        Example:
            list_scheduled_tasks()
        """
        if not self.scheduler:
            return {"success": False, "error": "Scheduler not available"}
        
        try:
            tasks = self.scheduler.list_user_tasks(self.user_id)
            return {
                "success": True,
                "tasks": tasks,
                "count": len(tasks)
            }
        
        except Exception as e:
            logger.error(f"Error listing tasks: {e}")
            return {"success": False, "error": str(e)}
    
    def cancel_task(self, task_id: str) -> dict:
        """
        Cancel a scheduled task.
        
        Args:
            task_id: ID of the task to cancel
        
        Returns:
            dict: Cancellation confirmation
        
        Example:
            cancel_task("portfolio_analysis_user123_1234567890")
        """
        if not self.scheduler:
            return {"success": False, "error": "Scheduler not available"}
        
        try:
            success = self.scheduler.cancel_task(task_id)
            if success:
                logger.info(f"Cancelled task: {task_id}")
                return {
                    "success": True,
                    "message": f"Task {task_id} cancelled"
                }
            else:
                return {"success": False, "error": "Task not found"}
        
        except Exception as e:
            logger.error(f"Error cancelling task: {e}")
            return {"success": False, "error": str(e)}
    
    def _parse_time_str(self, time_str: str) -> datetime:
        """Parse time string to datetime today"""
        time_str = time_str.strip().upper()
        
        # Try parsing with AM/PM
        for fmt in ["%I:%M %p", "%I:%M%p", "%H:%M"]:
            try:
                time_obj = datetime.strptime(time_str, fmt).time()
                # Combine with today's date
                scheduled = datetime.combine(datetime.now().date(), time_obj)
                
                # If time has passed today, schedule for tomorrow
                if scheduled < datetime.now():
                    scheduled += timedelta(days=1)
                
                return scheduled
            except ValueError:
                continue
        
        raise ValueError(f"Could not parse time: {time_str}. Use format like '3:30 PM' or '15:30'")
