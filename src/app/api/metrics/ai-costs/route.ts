import { NextResponse } from 'next/server'

/**
 * AI Pricing Table (Cost per 1,000 tokens in USD)
 * Ref: Standard pricing for current models (late 2024)
 */
const PRICING_TABLE: Record<string, { prompt: number; completion: number }> = {
  'gemini-1.5-pro': { prompt: 0.0035, completion: 0.0105 },
  'gemini-1.5-flash': { prompt: 0.000075, completion: 0.0003 },
  'xai/grok-4.1-fast': { prompt: 0.002, completion: 0.010 },
  'gpt-4o': { prompt: 0.005, completion: 0.015 },
  'claude-3-5-sonnet': { prompt: 0.003, completion: 0.015 }
}

/**
 * Placeholder for Currency Conversion (USD -> BRL)
 * In production, this should fetch from an external API or a cached value.
 */
const USD_TO_BRL_RATE = 5.50

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // --- DATA AGGREGATION (Simulated Redis Interaction) ---
    // In a real scenario:
    // const keys = await redis.keys(`usage:${date}:*`)
    // const usageData = await Promise.all(keys.map(k => redis.hgetall(k)))
    
    // Simulating aggregation from Redis keys usage:{date}:{model}
    // Assume each model has 'prompt_tokens' and 'completion_tokens'
    const simulatedUsage = [
      { model: 'gemini-1.5-pro', prompt_tokens: 154200, completion_tokens: 42000 },
      { model: 'gemini-1.5-flash', prompt_tokens: 850000, completion_tokens: 120000 },
      { model: 'xai/grok-4.1-fast', prompt_tokens: 50000, completion_tokens: 15000 },
      { model: 'claude-3-5-sonnet', prompt_tokens: 12000, completion_tokens: 5000 }
    ]

    const report = simulatedUsage.map(usage => {
      const pricing = PRICING_TABLE[usage.model] || { prompt: 0, completion: 0 }
      
      const promptCostUSD = (usage.prompt_tokens / 1000) * pricing.prompt
      const completionCostUSD = (usage.completion_tokens / 1000) * pricing.completion
      const totalCostUSD = promptCostUSD + completionCostUSD
      const totalCostBRL = totalCostUSD * USD_TO_BRL_RATE

      return {
        ...usage,
        costs: {
          promptUSD: promptCostUSD.toFixed(4),
          completionUSD: completionCostUSD.toFixed(4),
          totalUSD: totalCostUSD.toFixed(4),
          totalBRL: totalCostBRL.toFixed(2)
        }
      }
    })

    const totalAggregatedUSD = report.reduce((acc, curr) => acc + parseFloat(curr.costs.totalUSD), 0)
    const totalAggregatedBRL = report.reduce((acc, curr) => acc + parseFloat(curr.costs.totalBRL), 0)

    return NextResponse.json({
      date,
      currency: 'BRL',
      exchangeRate: USD_TO_BRL_RATE,
      summary: {
        totalUSD: totalAggregatedUSD.toFixed(2),
        totalBRL: totalAggregatedBRL.toFixed(2)
      },
      details: report
    })

  } catch (error) {
    console.error('[AI_COST_METRICS_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    )
  }
}
