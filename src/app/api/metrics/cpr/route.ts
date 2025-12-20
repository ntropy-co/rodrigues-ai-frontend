/**
 * API Route: /api/metrics/cpr
 *
 * Gerencia métricas de CPR (Valor Total e Quantidade) usando Redis.
 * GET: Retorna os valores atuais.
 * POST: Incrementa os valores (para uso interno/webhook).
 */

import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

// Chaves do Redis
const KEY_TOTAL_VALUE = 'metrics:cpr:total_value' // em centavos
const KEY_TOTAL_COUNT = 'metrics:cpr:total_count'

export async function GET() {
  try {
    // Buscar valores em paralelo
    const [totalValueCents, totalCount] = await Promise.all([
      redis.get<number>(KEY_TOTAL_VALUE),
      redis.get<number>(KEY_TOTAL_COUNT)
    ])

    // Converter centavos para reais (float) para o frontend
    const totalValue = (totalValueCents || 0) / 100

    return NextResponse.json({
      success: true,
      data: {
        totalValue,
        totalCount: totalCount || 0
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[API Metrics] Error fetching CPR stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { value, count = 1 } = body

    if (typeof value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Value is required and must be a number' },
        { status: 400 }
      )
    }

    // Armazenar em centavos para evitar problemas de ponto flutuante
    // Se o valor vier em reais (ex: 150.50), converte para 15050
    const valueInCents = Math.round(value * 100)

    // Usar pipelines para operações atômicas (ou incrby/incrbyfloat)
    // Redis incrby aceita apenas inteiros, perfeito para centavos e count
    const [newValueCents, newCount] = await Promise.all([
      redis.incrby(KEY_TOTAL_VALUE, valueInCents),
      redis.incrby(KEY_TOTAL_COUNT, count)
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalValue: newValueCents / 100,
        totalCount: newCount
      }
    })
  } catch (error) {
    console.error('[API Metrics] Error updating CPR stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update metrics' },
      { status: 500 }
    )
  }
}
