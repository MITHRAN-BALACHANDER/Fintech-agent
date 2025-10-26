"""
Notification tools for sending alerts via multiple channels
"""
from agno.tools import Toolkit
from agno.utils.log import logger
from typing import Optional, List
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class NotificationTools(Toolkit):
    """Tools for sending notifications via email, SMS, and webhooks"""
    
    def __init__(self, name: str = "notification_tools", user_email: str = None, user_phone: str = None):
        super().__init__(name=name)
        self.register(self.send_email_alert)
        self.register(self.send_sms_alert)
        self.register(self.trigger_webhook)
        
        # Store user contact info
        self.user_email = user_email
        self.user_phone = user_phone
        
        # Load credentials from environment
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("GMAIL_USER", os.getenv("SMTP_USER", ""))
        self.smtp_password = os.getenv("GMAIL_PASS", os.getenv("SMTP_PASSWORD", ""))
    
    def send_email_alert(self, subject: str, message: str, to_email: str = None) -> str:
        """
        Send email notification to user.
        
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
            
            if not self.smtp_user or not self.smtp_password:
                logger.warning("SMTP credentials not configured, simulating email send")
                return f"[SIMULATED] Email sent to {recipient}\nSubject: {subject}\n\n{message}"
            
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = recipient
            msg['Subject'] = subject
            
            msg.attach(MIMEText(message, 'html'))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return f"✅ Email sent successfully to {recipient}"
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return f"❌ Failed to send email: {str(e)}"
    
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
