/**
 * Cron Job: Atualização de Cotações
 *
 * Endpoint chamado via Cron (Vercel Cron ou GitHub Actions) para atualizar
 * o cache de todas as commodities.
 *
 * Headers esperados:
 * - Authorization: Bearer {CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchAllCommodityQuotes } from '@/lib/quotes'
import { redis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    // 1. Validar autorização
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Permitir em development sem secret para testes fáceis
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[Cron] Starting quotes update...')

    // 2. Forçar atualização (invalidar cache antigo se necessário, mas o fetchAll já lida com refresh se configurado)
    // Na implementação atual do lib/quotes.ts, o cache é respeitado (15min).
    // Para um cron diário, podemos querer invalidar explicitamente.

    const pattern = 'quote:*'
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`[Cron] Cleared ${keys.length} cache keys`)
    }

    // 3. Buscar novos dados
    const quotes = await fetchAllCommodityQuotes()

    console.log(`[Cron] Successfully updated ${quotes.length} quotes`)

    return NextResponse.json({
      success: true,
      updatedCount: quotes.length,
      timestamp: new Date().toISOString(),
      quotes: quotes.map((q) => q.symbol)
    })
  } catch (error) {
    console.error('[Cron] Error updating quotes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update quotes' },
      { status: 500 }
    )
  }
}
