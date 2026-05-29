import sys
import json
import math

def calculate_sma(prices, period):
    if len(prices) < period:
        return prices[-1] if prices else 0
    return sum(prices[-period:]) / period

def calculate_rsi(prices, period=14):
    if len(prices) < period + 1:
        return 50
    
    gains = 0
    losses = 0
    
    for i in range(1, period + 1):
        diff = prices[i] - prices[i - 1]
        if diff >= 0:
            gains += diff
        else:
            losses -= diff
            
    avg_gain = gains / period
    avg_loss = losses / period
    
    for i in range(period + 1, len(prices)):
        diff = prices[i] - prices[i - 1]
        if diff >= 0:
            avg_gain = (avg_gain * (period - 1) + diff) / period
            avg_loss = (avg_loss * (period - 1)) / period
        else:
            avg_gain = (avg_gain * (period - 1)) / period
            avg_loss = (avg_loss * (period - 1) - diff) / period
            
    if avg_loss == 0:
        return 100
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def main():
    try:
        # Read JSON string from command line arguments
        input_data = sys.argv[1]
        chart_data = json.loads(input_data)
        
        # Extract closing prices
        prices = [d['close'] for d in chart_data['data'] if d.get('close') is not None]
        
        if len(prices) < 20:
            print(json.dumps({"error": "Not enough data points"}))
            return
            
        current_price = prices[-1]
        
        # Calculate Technical Indicators using Python
        sma20 = calculate_sma(prices, 20)
        sma50 = calculate_sma(prices, 50)
        rsi = calculate_rsi(prices)
        
        # Advanced Python Prediction (Simple Moving Average Crossover + RSI Logic)
        trend_score = 0
        if current_price > sma20:
            trend_score += 1
        else:
            trend_score -= 1
            
        if current_price > sma50:
            trend_score += 1
        else:
            trend_score -= 1
            
        if rsi > 50:
            trend_score += 1
        else:
            trend_score -= 1
            
        if rsi > 70:
            trend_score -= 2 # Overbought, bearish signal
        if rsi < 30:
            trend_score += 2 # Oversold, bullish signal
            
        trend = "Neutral"
        if trend_score >= 2:
            trend = "Bullish"
        elif trend_score <= -2:
            trend = "Bearish"
            
        # Return result as JSON
        result = {
            "trend": trend,
            "score": trend_score,
            "rsi": rsi,
            "sma20": sma20,
            "sma50": sma50
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
