"""
Test script for formatted email templates
"""
import os
from dotenv import load_dotenv
from tools.notification_tools import NotificationTools

# Load environment variables
load_dotenv()

def test_watchlist_analysis_email():
    """Test sending a formatted watchlist analysis email"""
    
    # Create notification tools instance
    notification_tools = NotificationTools(
        user_email="bmithran15@gmail.com",
        user_name="Mithran"
    )
    
    # Sample watchlist data
    watchlist_data = {
        "watchlists": [
            {
                "name": "Indian Stocks",
                "assets": [
                    {
                        "symbol": "TCS.NS",
                        "price": "₹3,138.70",
                        "change": "+5.30",
                        "change_percent": "+0.17%",
                        "trend": "Bullish",
                        "recommendation": "Hold - Strong uptrend, trading above key moving averages"
                    },
                    {
                        "symbol": "INFY.NS",
                        "price": "₹1,845.20",
                        "change": "-12.50",
                        "change_percent": "-0.67%",
                        "trend": "Neutral",
                        "recommendation": "Watch - Consolidating near support level"
                    }
                ]
            },
            {
                "name": "US Tech Stocks",
                "assets": [
                    {
                        "symbol": "AAPL",
                        "price": "$195.50",
                        "change": "+4.30",
                        "change_percent": "+2.25%",
                        "trend": "Bullish",
                        "recommendation": "Buy - Breaking out above resistance"
                    },
                    {
                        "symbol": "MSFT",
                        "price": "$425.80",
                        "change": "-8.20",
                        "change_percent": "-1.89%",
                        "trend": "Bearish",
                        "recommendation": "Sell - Weak momentum, RSI showing weakness"
                    }
                ]
            }
        ]
    }
    
    print("📧 Sending formatted watchlist analysis email...")
    print(f"To: {notification_tools.user_email}")
    print(f"User: {notification_tools.user_name}")
    print("\n" + "="*60 + "\n")
    
    result = notification_tools.send_formatted_email(
        email_type="watchlist_analysis",
        subject="📊 Your Watchlist Analysis Report",
        data=watchlist_data
    )
    
    print(result)
    print("\n" + "="*60 + "\n")

def test_price_alert_email():
    """Test sending a formatted price alert email"""
    
    notification_tools = NotificationTools(
        user_email="bmithran15@gmail.com",
        user_name="Mithran"
    )
    
    price_alert_data = {
        "symbol": "AAPL",
        "price": 195.50,
        "alert_type": "above",
        "threshold": 195.00
    }
    
    print("📧 Sending formatted price alert email...")
    print(f"To: {notification_tools.user_email}")
    print("\n" + "="*60 + "\n")
    
    result = notification_tools.send_formatted_email(
        email_type="price_alert",
        subject="🔔 Price Alert: AAPL",
        data=price_alert_data
    )
    
    print(result)
    print("\n" + "="*60 + "\n")

def test_generic_email():
    """Test sending a formatted generic email"""
    
    notification_tools = NotificationTools(
        user_email="bmithran15@gmail.com",
        user_name="Mithran"
    )
    
    generic_data = {
        "title": "📈 Market Update",
        "message": """
        <p>Here's your daily market summary:</p>
        <ul>
            <li><strong>S&P 500:</strong> Up 1.2% - Strong bullish momentum</li>
            <li><strong>NASDAQ:</strong> Up 1.8% - Tech stocks leading the rally</li>
            <li><strong>Dow Jones:</strong> Up 0.9% - Steady gains across sectors</li>
        </ul>
        <p>The market is showing strong bullish sentiment with all major indices in the green. Consider reviewing your portfolio allocations.</p>
        """
    }
    
    print("📧 Sending formatted generic email...")
    print(f"To: {notification_tools.user_email}")
    print("\n" + "="*60 + "\n")
    
    result = notification_tools.send_formatted_email(
        email_type="generic",
        subject="📈 Daily Market Update",
        data=generic_data
    )
    
    print(result)
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  FORMATTED EMAIL TEMPLATE TESTS")
    print("="*60 + "\n")
    
    # Test all email types
    test_watchlist_analysis_email()
    
    # Uncomment to test other email types:
    # test_price_alert_email()
    # test_generic_email()
    
    print("\n✅ Email template tests completed!")
    print("\nCheck your email inbox for the beautifully formatted emails!")
