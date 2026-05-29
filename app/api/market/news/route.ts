import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const queries = ['NIFTY', 'SENSEX', 'global market', 'Indian stock market']
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    }

    const fetchPromises = queries.map(q => 
      fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}`, { headers, next: { revalidate: 300 } })
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
    )

    const results = await Promise.all(fetchPromises)
    const combinedNews: any[] = []
    const seenUuids = new Set<string>()

    for (const data of results) {
      if (data && data.news) {
        for (const item of data.news) {
          if (item.uuid && !seenUuids.has(item.uuid)) {
            seenUuids.add(item.uuid)
            combinedNews.push({
              uuid: item.uuid,
              title: item.title,
              publisher: item.publisher,
              link: item.link,
              providerPublishTime: item.providerPublishTime
            })
          }
        }
      }
    }

    // Sort by publish time descending
    combinedNews.sort((a, b) => b.providerPublishTime - a.providerPublishTime)

    // Return top 15 news articles
    return NextResponse.json({
      success: true,
      data: combinedNews.slice(0, 15),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Market news error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market news' 
      },
      { status: 500 }
    )
  }
}
