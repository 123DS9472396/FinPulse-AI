import { NextRequest, NextResponse } from 'next/server'
import { marketDataService, INDIAN_STOCKS } from '@/lib/market-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '20')
  
  try {
    let results = []
    
    if (query) {
      // Search functionality
      const filteredSymbols = INDIAN_STOCKS.filter(symbol => 
        symbol.toLowerCase().includes(query.toLowerCase()) ||
        symbol.toLowerCase().startsWith(query.toLowerCase())
      ).slice(0, limit)
      
      // Get stock data for filtered symbols
      results = await marketDataService.getMultipleStocks(filteredSymbols)
      
      // If no exact matches, try fuzzy search
      if (results.length === 0) {
        const fuzzyMatches = INDIAN_STOCKS.filter(symbol => {
          const symbolLower = symbol.toLowerCase()
          const queryLower = query.toLowerCase()
          return symbolLower.includes(queryLower) || 
                 queryLower.split('').every(char => symbolLower.includes(char))
        }).slice(0, 10)
        
        results = await marketDataService.getMultipleStocks(fuzzyMatches)
      }
    } else {
      // Return popular stocks by default
      const popularStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'ITC', 'SBIN']
      results = await marketDataService.getMultipleStocks(popularStocks)
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      query: query || 'popular'
    })
    
  } catch (error) {
    console.error('Stock search error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search stocks',
        data: []
      },
      { status: 500 }
    )
  }
}
