"""
Test script for Mailgun email integration
"""
import os
from dotenv import load_dotenv
from tools.notification_tools import NotificationTools

# Load environment variables
load_dotenv()

def test_mailgun_email():
    """Test sending an email via Mailgun"""
    
    # Create notification tools instance
    notification_tools = NotificationTools(
        user_email="mithranbalachander@gmail.com"  # Replace with your test email
    )
    
    # Test email content
    subject = "FinSIght Platform - Mailgun Integration Test"
    message = """
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
            <h1 style="color: #2563eb;">🚀 Mailgun Integration Success!</h1>
            <p>This is a test email from the FinSIght Platform.</p>
            <p>If you're reading this, Mailgun is now successfully integrated and working! 🎉</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Email Details:</h3>
                <ul>
                    <li><strong>Platform:</strong> FinSIght Trading Assistant</li>
                    <li><strong>Email Service:</strong> Mailgun API</li>
                    <li><strong>Status:</strong> Active ✅</li>
                </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This email was sent using Mailgun's API integration.
            </p>
        </div>
    </body>
    </html>
    """
    
    # Send the test email
    print("📧 Sending test email via Mailgun...")
    print(f"API Key: {notification_tools.mailgun_api_key[:20]}...")
    print(f"Domain: {notification_tools.mailgun_domain}")
    print(f"From: {notification_tools.mailgun_from_email}")
    print(f"To: {notification_tools.user_email}")
    print("\n" + "="*60 + "\n")
    
    result = notification_tools.send_email_alert(
        subject=subject,
        message=message
    )
    
    print(result)
    print("\n" + "="*60 + "\n")
    
    # Print configuration status and instructions
    if "403" in result or "not allowed to send" in result:
        print("\n📋 MAILGUN SANDBOX INSTRUCTIONS:")
        print("="*60)
        print("\n🔑 Your Mailgun integration is working correctly!")
        print("   However, sandbox domains have restrictions.\n")
        print("To send emails from a sandbox domain, you need to:")
        print("\n1. Add authorized recipients in Mailgun dashboard:")
        print("   https://app.mailgun.com/app/sending/domains/sandbox47eb220eb3264af382fca4725d907790.mailgun.org/sending-settings/authorized-recipients")
        print("\n2. OR upgrade to a paid plan to send to any email address")
        print("\n3. OR verify your own domain (recommended for production)")
        print("   https://app.mailgun.com/app/domains/new")
        print("\n" + "="*60)
    elif not notification_tools.mailgun_domain:
        print("⚠️  WARNING: MAILGUN_DOMAIN is not set in your .env file")
        print("   Please add your Mailgun domain to the .env file:")
        print("   MAILGUN_DOMAIN=your_domain.mailgun.org")
        print("\n   You can find your domain in the Mailgun dashboard:")
        print("   https://app.mailgun.com/app/domains")

if __name__ == "__main__":
    test_mailgun_email()
