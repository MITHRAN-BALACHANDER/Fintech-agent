"""
Professional HTML email templates matching the FinSIght application UI
"""
from datetime import datetime
from typing import List, Dict, Optional


class EmailTemplates:
    """Professional email templates with modern design matching the app UI"""
    
    # Brand colors matching the application OKLCH design system
    PRIMARY_COLOR = "#f5a524"  # oklch(0.7214 0.1337 49.9802) - Primary yellow/orange
    SECONDARY_COLOR = "#5ba8c9"  # oklch(0.5940 0.0443 196.0233) - Secondary blue
    BACKGROUND_COLOR = "#ffffff"  # oklch(1.0000 0 0)
    BACKGROUND_DARK = "#2a2830"  # oklch(0.1797 0.0043 308.1928)
    TEXT_COLOR = "#252334"  # oklch(0.2101 0.0318 264.6645)
    TEXT_MUTED = "#847d96"  # oklch(0.5510 0.0234 264.3637)
    CARD_BG = "#ffffff"  # oklch(1.0000 0 0)
    BORDER_COLOR = "#e8e5ed"  # oklch(0.9276 0.0058 264.5313)
    SUCCESS_COLOR = "#22c55e"
    WARNING_COLOR = "#f59e0b"
    DANGER_COLOR = "#ef4444"
    
    @staticmethod
    def get_currency_symbol(symbol: str) -> str:
        """
        Get the appropriate currency symbol based on stock symbol.
        Indian stocks (NSE/BSE) use ₹, US stocks use $
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL', 'TCS.NS', 'RELIANCE.BO')
        
        Returns:
            Currency symbol (₹ or $)
        """
        if symbol and (symbol.endswith('.NS') or symbol.endswith('.BO')):
            return '₹'
        return '$'
    
    @staticmethod
    def format_price(price: float, symbol: str) -> str:
        """
        Format price with appropriate currency symbol.
        
        Args:
            price: The price value
            symbol: Stock symbol to determine currency
        
        Returns:
            Formatted price string with currency symbol
        """
        currency = EmailTemplates.get_currency_symbol(symbol)
        return f"{currency}{price:,.2f}"
    
    @staticmethod
    def _base_template(title: str, content: str, preheader: str = "") -> str:
        """Base email template with responsive design"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>{title}</title>
    <!--[if mso]>
    <style type="text/css">
        table {{border-collapse: collapse; border-spacing: 0; margin: 0;}}
        div, td {{padding: 0;}}
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {{
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f8fafc;
            color: {EmailTemplates.TEXT_COLOR};
            line-height: 1.6;
        }}
        
        .email-wrapper {{
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 20px;
        }}
        
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: {EmailTemplates.BACKGROUND_COLOR};
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }}
        
        .email-header {{
            background: linear-gradient(135deg, {EmailTemplates.PRIMARY_COLOR} 0%, {EmailTemplates.SECONDARY_COLOR} 100%);
            padding: 32px 40px;
            text-align: center;
        }}
        
        .logo {{
            display: inline-flex;
            align-items: center;
            gap: 12px;
            color: white;
            font-size: 24px;
            font-weight: 700;
            text-decoration: none;
            margin-bottom: 8px;
        }}
        
        .logo-icon {{
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }}
        
        .header-subtitle {{
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 4px;
        }}
        
        .email-content {{
            padding: 40px;
        }}
        
        h1 {{
            color: {EmailTemplates.TEXT_COLOR};
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }}
        
        h2 {{
            color: {EmailTemplates.TEXT_COLOR};
            font-size: 20px;
            font-weight: 600;
            margin: 32px 0 16px 0;
        }}
        
        h3 {{
            color: {EmailTemplates.TEXT_COLOR};
            font-size: 16px;
            font-weight: 600;
            margin: 24px 0 12px 0;
        }}
        
        p {{
            color: {EmailTemplates.TEXT_COLOR};
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 16px 0;
        }}
        
        .section {{
            background: #fafafa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid {EmailTemplates.PRIMARY_COLOR};
        }}
        
        .table-container {{
            overflow-x: auto;
            margin: 20px 0;
        }}
        
        .data-table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid {EmailTemplates.BORDER_COLOR};
            border-radius: 8px;
            overflow: hidden;
        }}
        
        .data-table th {{
            background: #fafafa;
            color: {EmailTemplates.TEXT_COLOR};
            font-weight: 600;
            font-size: 13px;
            text-align: left;
            padding: 12px 16px;
            border-bottom: 2px solid {EmailTemplates.BORDER_COLOR};
            letter-spacing: 0.025em;
        }}
        
        .data-table td {{
            padding: 12px 16px;
            font-size: 14px;
            border-bottom: 1px solid {EmailTemplates.BORDER_COLOR};
        }}
        
        .data-table tr:last-child td {{
            border-bottom: none;
        }}
        
        .badge {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        
        .badge-success {{
            background: rgba(34, 197, 94, 0.1);
            color: {EmailTemplates.SUCCESS_COLOR};
        }}
        
        .badge-warning {{
            background: rgba(245, 158, 11, 0.1);
            color: {EmailTemplates.WARNING_COLOR};
        }}
        
        .badge-danger {{
            background: rgba(239, 68, 68, 0.1);
            color: {EmailTemplates.DANGER_COLOR};
        }}
        
        .badge-neutral {{
            background: rgba(132, 125, 150, 0.1);
            color: {EmailTemplates.TEXT_MUTED};
        }}
        
        .stat-card {{
            background: white;
            border: 1px solid {EmailTemplates.BORDER_COLOR};
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
        }}
        
        .stat-label {{
            color: {EmailTemplates.TEXT_MUTED};
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }}
        
        .stat-value {{
            color: {EmailTemplates.TEXT_COLOR};
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }}
        
        .button {{
            display: inline-block;
            padding: 12px 28px;
            background: {EmailTemplates.PRIMARY_COLOR};
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            margin: 20px 0;
            transition: all 0.14s ease-out;
            box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.05);
        }}
        
        .button:hover {{
            background: #e09920;
            transform: translateY(-1px);
            box-shadow: 0px 4px 6px 0px rgba(0, 0, 0, 0.1);
        }}
        
        .email-footer {{
            background: #fafafa;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid {EmailTemplates.BORDER_COLOR};
        }}
        
        .footer-text {{
            color: {EmailTemplates.TEXT_MUTED};
            font-size: 13px;
            line-height: 1.6;
            margin: 8px 0;
        }}
        
        .footer-links {{
            margin-top: 16px;
        }}
        
        .footer-link {{
            color: {EmailTemplates.PRIMARY_COLOR};
            text-decoration: none;
            font-size: 13px;
            margin: 0 12px;
        }}
        
        .divider {{
            height: 1px;
            background: {EmailTemplates.BORDER_COLOR};
            margin: 24px 0;
        }}
        
        @media only screen and (max-width: 600px) {{
            .email-wrapper {{
                padding: 20px 10px;
            }}
            
            .email-header {{
                padding: 24px 20px;
            }}
            
            .email-content {{
                padding: 24px 20px;
            }}
            
            .email-footer {{
                padding: 24px 20px;
            }}
            
            h1 {{
                font-size: 20px;
            }}
            
            h2 {{
                font-size: 18px;
            }}
            
            .data-table th,
            .data-table td {{
                padding: 8px 12px;
                font-size: 13px;
            }}
        }}
    </style>
</head>
<body>
    <div style="display: none; max-height: 0; overflow: hidden;">{preheader}</div>
    
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <div class="logo">
                    <span class="logo-icon">📈</span>
                    <span>FinSIght</span>
                </div>
                <div class="header-subtitle">Your AI-Powered Trading Assistant</div>
            </div>
            
            <!-- Content -->
            <div class="email-content">
                {content}
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <p class="footer-text">
                    This email was sent by FinSIght Platform<br>
                    {datetime.now().strftime("%B %d, %Y at %I:%M %p")}
                </p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Dashboard</a>
                    <a href="#" class="footer-link">Settings</a>
                    <a href="#" class="footer-link">Support</a>
                </div>
                <p class="footer-text" style="margin-top: 20px; font-size: 11px;">
                    © 2025 FinSIght. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
"""
    
    @classmethod
    def watchlist_analysis(cls, watchlist_data: List[Dict], user_name: str = "there") -> str:
        """Generate formatted watchlist analysis email"""
        
        content = f"""
        <h1>📊 Watchlist Analysis Report</h1>
        <p>Hi {user_name},</p>
        <p>Here's your comprehensive analysis of all tracked assets across your watchlists.</p>
        """
        
        for watchlist in watchlist_data:
            watchlist_name = watchlist.get('name', 'Watchlist')
            assets = watchlist.get('assets', [])
            
            content += f"""
            <h2>{watchlist_name}</h2>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Price</th>
                            <th>Change</th>
                            <th>Trend</th>
                            <th>Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
            """
            
            for asset in assets:
                symbol = asset.get('symbol', 'N/A')
                price = asset.get('price', 'N/A')
                change = asset.get('change', '0')
                change_pct = asset.get('change_percent', '0')
                trend = asset.get('trend', 'neutral')
                recommendation = asset.get('recommendation', 'Hold')
                
                # Determine badge style based on change
                try:
                    change_val = float(change_pct.replace('%', ''))
                    if change_val > 2:
                        change_class = "badge-success"
                        trend_emoji = "📈"
                    elif change_val < -2:
                        change_class = "badge-danger"
                        trend_emoji = "📉"
                    else:
                        change_class = "badge-neutral"
                        trend_emoji = "➡️"
                except:
                    change_class = "badge-neutral"
                    trend_emoji = "➡️"
                
                content += f"""
                        <tr>
                            <td><strong>{symbol}</strong></td>
                            <td>{price}</td>
                            <td><span class="badge {change_class}">{change_pct}</span></td>
                            <td>{trend_emoji} {trend}</td>
                            <td>{recommendation}</td>
                        </tr>
                """
            
            content += """
                    </tbody>
                </table>
            </div>
            """
        
        content += """
        <div class="section">
            <h3>💡 What's Next?</h3>
            <p>Review the recommendations above and consider adjusting your trading strategy based on current market conditions. You can update your rules or create new alerts directly from your dashboard.</p>
        </div>
        
        <a href="#" class="button">View Full Dashboard →</a>
        """
        
        return cls._base_template(
            title="Watchlist Analysis Report",
            content=content,
            preheader="Your comprehensive watchlist analysis is ready"
        )
    
    @classmethod
    def price_alert(cls, symbol: str, price: float, alert_type: str, threshold: float, user_name: str = "there") -> str:
        """Generate price alert email"""
        
        emoji = "🔔" if alert_type == "above" else "📢"
        alert_text = f"reached above" if alert_type == "above" else "dropped below"
        
        content = f"""
        <h1>{emoji} Price Alert Triggered</h1>
        <p>Hi {user_name},</p>
        <p>Your price alert for <strong>{symbol}</strong> has been triggered!</p>
        
        <div class="section">
            <div class="stat-card">
                <div class="stat-label">Current Price</div>
                <p class="stat-value">{cls.format_price(price, symbol)}</p>
            </div>
            <p style="margin-top: 16px;">
                <strong>{symbol}</strong> has {alert_text} your threshold of <strong>{cls.format_price(threshold, symbol)}</strong>
            </p>
        </div>
        
        <h3>📈 What You Can Do</h3>
        <p>• Review your trading rules and adjust if needed<br>
        • Check technical indicators for confirmation<br>
        • Consider your risk profile before taking action</p>
        
        <a href="#" class="button">View {symbol} Details →</a>
        """
        
        return cls._base_template(
            title=f"Price Alert: {symbol}",
            content=content,
            preheader=f"{symbol} has {alert_text} {cls.format_price(threshold, symbol)}"
        )
    
    @classmethod
    def rule_triggered(cls, rule_name: str, asset: str, details: str, user_name: str = "there") -> str:
        """Generate rule triggered notification email"""
        
        content = f"""
        <h1>⚡ Trading Rule Triggered</h1>
        <p>Hi {user_name},</p>
        <p>Your trading rule <strong>"{rule_name}"</strong> has been triggered for <strong>{asset}</strong>.</p>
        
        <div class="section">
            <h3>Rule Details</h3>
            <p>{details}</p>
        </div>
        
        <h3>🎯 Recommended Actions</h3>
        <p>• Review the current market conditions<br>
        • Check your portfolio allocation<br>
        • Consider executing the trade if conditions align with your strategy</p>
        
        <a href="#" class="button">Manage Rules →</a>
        """
        
        return cls._base_template(
            title=f"Rule Triggered: {rule_name}",
            content=content,
            preheader=f"Your rule '{rule_name}' has been triggered for {asset}"
        )
    
    @classmethod
    def generic_notification(cls, title: str, message: str, user_name: str = "there") -> str:
        """Generate generic notification email"""
        
        content = f"""
        <h1>{title}</h1>
        <p>Hi {user_name},</p>
        {message}
        
        <a href="#" class="button">Go to Dashboard →</a>
        """
        
        return cls._base_template(
            title=title,
            content=content,
            preheader=title
        )
