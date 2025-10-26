"""
Market data tools for AGNO agents
Fetches real-time stock, crypto, and market data
"""
from agno.tools import Toolkit
from agno.utils.log import logger
from typing import Optional, Dict, Any, List
import yfinance as yf
from datetime import datetime, timedelta
import requests


class MarketDataTools(Toolkit):
    """Tools for fetching market data - stocks, crypto, news, sentiment"""
    
    def __init__(self, name: str = "market_data_tools"):
        super().__init__(name=name)
        self.register(self.get_stock_price)
        self.register(self.get_crypto_price)
        self.register(self.get_market_sentiment)
        self.register(self.get_stock_info)
        self.register(self.get_technical_indicators)
        self.register(self.search_market_news)
    
    def get_stock_price(self, symbol: str) -> str:
        """
        Get current stock price and basic metrics.
        
        Args:
            symbol: Stock ticker symbol (e.g., 'TCS.NS' for TCS on NSE, 'MSFT' for Microsoft)
        
        Returns:
            String with current price, change, volume, and market cap
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            history = ticker.history(period="1d")
            
            if history.empty:
                return f"No data available for {symbol}"
            
            current_price = history['Close'].iloc[-1]
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close else 0
            
            result = f"""Stock: {symbol}
Current Price: ₹{current_price:.2f}
Change: {change:+.2f} ({change_percent:+.2f}%)
Volume: {history['Volume'].iloc[-1]:,.0f}
Market Cap: ₹{info.get('marketCap', 0):,.0f}
52 Week High: ₹{info.get('fiftyTwoWeekHigh', 'N/A')}
52 Week Low: ₹{info.get('fiftyTwoWeekLow', 'N/A')}
"""
            return result
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {e}")
            return f"Error fetching data for {symbol}: {str(e)}"
    
    def get_crypto_price(self, symbol: str) -> str:
        """
        Get current cryptocurrency price.
        
        Args:
            symbol: Crypto ticker (e.g., 'BTC-USD', 'ETH-USD')
        
        Returns:
            String with current price, 24h change, volume, and market cap
        """
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period="1d")
            info = ticker.info
            
            if history.empty:
                return f"No data available for {symbol}"
            
            current_price = history['Close'].iloc[-1]
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close else 0
            
            result = f"""Cryptocurrency: {symbol}
Current Price: ${current_price:,.2f}
24h Change: ${change:+,.2f} ({change_percent:+.2f}%)
24h Volume: ${history['Volume'].iloc[-1]:,.0f}
Market Cap: ${info.get('marketCap', 0):,.0f}
"""
            return result
        except Exception as e:
            logger.error(f"Error fetching crypto price for {symbol}: {e}")
            return f"Error fetching data for {symbol}: {str(e)}"
    
    def get_stock_info(self, symbol: str) -> str:
        """
        Get detailed stock information including fundamentals.
        
        Args:
            symbol: Stock ticker symbol
        
        Returns:
            String with company info, PE ratio, EPS, dividend yield, etc.
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            result = f"""Company: {info.get('longName', symbol)}
Sector: {info.get('sector', 'N/A')}
Industry: {info.get('industry', 'N/A')}
P/E Ratio: {info.get('trailingPE', 'N/A')}
EPS: {info.get('trailingEps', 'N/A')}
Dividend Yield: {info.get('dividendYield', 0) * 100:.2f}%
Beta: {info.get('beta', 'N/A')}
Recommendation: {info.get('recommendationKey', 'N/A')}
Target Price: ₹{info.get('targetMeanPrice', 'N/A')}
"""
            return result
        except Exception as e:
            logger.error(f"Error fetching stock info for {symbol}: {e}")
            return f"Error fetching info for {symbol}: {str(e)}"
    
    def get_technical_indicators(self, symbol: str, period: str = "1mo") -> str:
        """
        Calculate technical indicators (SMA, RSI, momentum).
        
        Args:
            symbol: Stock/crypto ticker symbol
            period: Time period for analysis (1mo, 3mo, 6mo, 1y)
        
        Returns:
            String with technical indicators and trend analysis
        """
        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period=period)
            
            if history.empty or len(history) < 20:
                return f"Insufficient data for {symbol}"
            
            # Calculate Simple Moving Averages
            sma_20 = history['Close'].rolling(window=20).mean().iloc[-1]
            sma_50 = history['Close'].rolling(window=min(50, len(history))).mean().iloc[-1]
            current_price = history['Close'].iloc[-1]
            
            # Calculate RSI (simplified)
            delta = history['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            current_rsi = rsi.iloc[-1] if not rsi.empty else 50
            
            # Momentum
            momentum = ((current_price - history['Close'].iloc[0]) / history['Close'].iloc[0]) * 100
            
            trend = "BULLISH" if current_price > sma_20 > sma_50 else "BEARISH"
            rsi_signal = "Overbought" if current_rsi > 70 else "Oversold" if current_rsi < 30 else "Neutral"
            
            result = f"""Technical Analysis for {symbol}
Current Price: ₹{current_price:.2f}
20-day SMA: ₹{sma_20:.2f}
50-day SMA: ₹{sma_50:.2f}
RSI (14): {current_rsi:.2f} ({rsi_signal})
Momentum: {momentum:+.2f}%
Trend: {trend}
"""
            return result
        except Exception as e:
            logger.error(f"Error calculating technical indicators for {symbol}: {e}")
            return f"Error analyzing {symbol}: {str(e)}"
    
    def get_market_sentiment(self, query: str) -> str:
        """
        Analyze market sentiment using news headlines (simplified).
        
        Args:
            query: Stock symbol or market keyword
        
        Returns:
            String with sentiment analysis
        """
        # Simplified sentiment - in production use NLP APIs
        try:
            ticker = yf.Ticker(query)
            news = ticker.news
            
            if not news:
                return f"No recent news found for {query}"
            
            headlines = [item.get('title', '') for item in news[:5]]
            sentiment = "NEUTRAL"
            
            # Simple keyword-based sentiment
            positive_words = ['surge', 'gain', 'profit', 'growth', 'high', 'up', 'rally', 'positive']
            negative_words = ['fall', 'loss', 'drop', 'decline', 'low', 'down', 'crash', 'negative']
            
            text = ' '.join(headlines).lower()
            pos_count = sum(word in text for word in positive_words)
            neg_count = sum(word in text for word in negative_words)
            
            if pos_count > neg_count:
                sentiment = "POSITIVE"
            elif neg_count > pos_count:
                sentiment = "NEGATIVE"
            
            result = f"""Market Sentiment for {query}: {sentiment}

Recent Headlines:
"""
            for i, headline in enumerate(headlines, 1):
                result += f"{i}. {headline}\n"
            
            return result
        except Exception as e:
            logger.error(f"Error analyzing sentiment for {query}: {e}")
            return f"Error analyzing sentiment for {query}: {str(e)}"
    
    def search_market_news(self, query: str, max_results: int = 5) -> str:
        """
        Search for market news and analysis.
        
        Args:
            query: Search query (stock symbol, company name, or keyword)
            max_results: Maximum number of results to return
        
        Returns:
            String with news articles
        """
        try:
            ticker = yf.Ticker(query)
            news = ticker.news
            
            if not news:
                return f"No news found for {query}"
            
            result = f"Latest News for {query}:\n\n"
            for i, item in enumerate(news[:max_results], 1):
                title = item.get('title', 'No title')
                publisher = item.get('publisher', 'Unknown')
                link = item.get('link', '#')
                result += f"{i}. {title}\n   Source: {publisher}\n   Link: {link}\n\n"
            
            return result
        except Exception as e:
            logger.error(f"Error searching news for {query}: {e}")
            return f"Error searching news for {query}: {str(e)}"
