"""
Notification tools for sending alerts via multiple channels
"""
from agno.tools import Toolkit
from agno.utils.log import logger
from typing import Optional, List
import os
import requests
from tools.email_templates import EmailTemplates


class NotificationTools(Toolkit):
    """Tools for sending notifications via email, SMS, and webhooks"""
    
    def __init__(self, name: str = "notification_tools", user_email: str = None, user_phone: str = None, user_name: str = None):
        super().__init__(name=name)
        self.register(self.send_email_alert)
        self.register(self.send_formatted_email)
        self.register(self.send_sms_alert)
        self.register(self.trigger_webhook)
        
        # Store user contact info
        self.user_email = user_email
        self.user_phone = user_phone
        self.user_name = user_name or "there"
        
        # Load Mailgun credentials from environment
        self.mailgun_api_key = os.getenv("MAILGUN_API_KEY", "3991f9e1b91500b54752bf76f352f5d8-235e4bb2-14dd9ebc")
        self.mailgun_domain = os.getenv("MAILGUN_DOMAIN", "")  # e.g., "mg.yourdomain.com"
        self.mailgun_from_email = os.getenv("MAILGUN_FROM_EMAIL", "FinSIght Alerts <noreply@finsight.com>")
    
    def send_email_alert(self, subject: str, message: str, to_email: str = None) -> str:
        """
        Send email notification to user via Mailgun.
        
        Args:
            subject: Email subject line
            message: Email body content
            to_email: Optional recipient email address (defaults to user's registered email)
        
        Returns:
            Success or error message
        """
        try:
            # Use user's registered email if not specified
            recipient = to_email or self.user_email
            
            if not recipient:
                return "Error: No email address provided and no user email configured"
            
            if not self.mailgun_api_key or not self.mailgun_domain:
                logger.warning("Mailgun credentials not configured, simulating email send")
                return f"[SIMULATED] Email sent to {recipient}\nSubject: {subject}\n\n{message}"
            
            # Send email via Mailgun API
            mailgun_url = f"https://api.mailgun.net/v3/{self.mailgun_domain}/messages"
            
            response = requests.post(
                mailgun_url,
                auth=("api", self.mailgun_api_key),
                data={
                    "from": self.mailgun_from_email,
                    "to": recipient,
                    "subject": subject,
                    "html": message
                },
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Email sent successfully to {recipient}")
                return f"✅ Email sent successfully to {recipient}"
            else:
                # Try to parse JSON error, fallback to text
                try:
                    error_data = response.json()
                    error_msg = error_data.get("message", str(error_data))
                except:
                    error_msg = response.text or f"HTTP {response.status_code}"
                
                logger.error(f"Mailgun API error ({response.status_code}): {error_msg}")
                return f"❌ Failed to send email ({response.status_code}): {error_msg}"
                
        except Exception as e:
            logger.error(f"Error sending email via Mailgun: {e}")
            return f"❌ Failed to send email: {str(e)}"
    
    def send_formatted_email(self, email_type: str, subject: str, data: dict, to_email: str = None) -> str:
        """
        Send a beautifully formatted email using professional templates.
        
        Args:
            email_type: Type of email - "watchlist_analysis", "price_alert", "rule_triggered", or "generic"
            subject: Email subject line
            data: Dictionary containing email data (varies by type)
                For watchlist_analysis: {"watchlists": [{"name": "...", "assets": [...]}]}
                For price_alert: {"symbol": "AAPL", "price": 150.50, "alert_type": "above", "threshold": 150}
                For rule_triggered: {"rule_name": "...", "asset": "...", "details": "..."}
                For generic: {"title": "...", "message": "..."}
            to_email: Optional recipient email (defaults to user's registered email)
        
        Returns:
            Success or error message
        """
        try:
            recipient = to_email or self.user_email
            
            if not recipient:
                return "Error: No email address provided and no user email configured"
            
            # Generate HTML content based on email type
            if email_type == "watchlist_analysis":
                html_content = EmailTemplates.watchlist_analysis(
                    watchlist_data=data.get("watchlists", []),
                    user_name=self.user_name
                )
            elif email_type == "price_alert":
                html_content = EmailTemplates.price_alert(
                    symbol=data.get("symbol", ""),
                    price=data.get("price", 0),
                    alert_type=data.get("alert_type", "above"),
                    threshold=data.get("threshold", 0),
                    user_name=self.user_name
                )
            elif email_type == "rule_triggered":
                html_content = EmailTemplates.rule_triggered(
                    rule_name=data.get("rule_name", ""),
                    asset=data.get("asset", ""),
                    details=data.get("details", ""),
                    user_name=self.user_name
                )
            else:  # generic
                html_content = EmailTemplates.generic_notification(
                    title=data.get("title", subject),
                    message=data.get("message", ""),
                    user_name=self.user_name
                )
            
            # Send the formatted email
            return self.send_email_alert(subject, html_content, recipient)
            
        except Exception as e:
            logger.error(f"Error sending formatted email: {e}")
            return f"❌ Failed to send formatted email: {str(e)}"
    
    def send_sms_alert(self, message: str, phone: str = None) -> str:
        """
        Send SMS notification (uses Twilio or similar service).
        
        Args:
            message: SMS message content
            phone: Optional phone number (defaults to user's registered phone)
        
        Returns:
            Success or error message
        """
        try:
            # Use user's registered phone if not specified
            recipient = phone or self.user_phone
            
            if not recipient:
                return "Error: No phone number provided and no user phone configured"
            
            # In production, integrate with Twilio, AWS SNS, or similar
            logger.info(f"SMS to {recipient}: {message}")
            return f"📱 [SIMULATED] SMS sent to {recipient}\nMessage: {message}"
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            return f"❌ Failed to send SMS: {str(e)}"
    
    def trigger_webhook(self, url: str, payload: dict) -> str:
        """
        Trigger a webhook with custom payload.
        
        Args:
            url: Webhook URL
            payload: JSON payload to send
        
        Returns:
            Success or error message
        """
        try:
            import requests
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            return f"Webhook triggered successfully: {response.status_code}"
        except Exception as e:
            logger.error(f"Error triggering webhook: {e}")
            return f"Failed to trigger webhook: {str(e)}"
