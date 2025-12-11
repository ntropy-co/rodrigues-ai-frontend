'use client'

import { useMemo, useState, useEffect } from 'react'

/**
 * Período do dia para personalização contextual
 */
export type DayPeriod = 'dawn' | 'morning' | 'afternoon' | 'evening'

/**
 * Resultado do hook useGreeting
 */
export interface GreetingResult {
  /** Saudação principal (ex: "Bom dia") */
  greeting: string
  /** Subtexto contextual (ex: "Como posso ajudar com suas análises?") */
  subtext: string
  /** Período do dia para estilização ou lógica adicional */
  period: DayPeriod
}

/**
 * Configuração de saudação por período
 */
interface PeriodConfig {
  greeting: string
  subtext: string
}

const PERIOD_CONFIG: Record<DayPeriod, PeriodConfig> = {
  dawn: {
    greeting: 'Boa madrugada',
    subtext: 'Trabalhando até tarde? Posso ajudar com suas análises.'
  },
  morning: {
    greeting: 'Bom dia',
    subtext: 'Como posso ajudar com suas análises hoje?'
  },
  afternoon: {
    greeting: 'Boa tarde',
    subtext: 'Pronto para continuar suas análises?'
  },
  evening: {
    greeting: 'Boa noite',
    subtext: 'Vamos revisar suas operações?'
  }
}

/**
 * Determina o período do dia baseado na hora atual
 */
function getPeriodFromHour(hour: number): DayPeriod {
  if (hour >= 0 && hour < 6) return 'dawn'
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

/**
 * Hook que retorna saudação dinâmica baseada no horário local.
 *
 * @example
 * ```tsx
 * const { greeting, subtext, period } = useGreeting()
 * // greeting: "Bom dia"
 * // subtext: "Como posso ajudar com suas análises hoje?"
 * // period: "morning"
 * ```
 *
 * Atualiza automaticamente quando a hora muda de período.
 */
export function useGreeting(): GreetingResult {
  // Estado para forçar re-render quando hora muda
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours())

  // Efeito que verifica mudança de hora a cada minuto
  useEffect(() => {
    const checkHour = () => {
      const newHour = new Date().getHours()
      if (newHour !== currentHour) {
        setCurrentHour(newHour)
      }
    }

    // Verificar a cada minuto
    const interval = setInterval(checkHour, 60000)

    return () => clearInterval(interval)
  }, [currentHour])

  // Memoriza o resultado para evitar recálculos desnecessários
  const result = useMemo<GreetingResult>(() => {
    const period = getPeriodFromHour(currentHour)
    const config = PERIOD_CONFIG[period]

    return {
      greeting: config.greeting,
      subtext: config.subtext,
      period
    }
  }, [currentHour])

  return result
}

/**
 * Versão server-safe que aceita hora como parâmetro.
 * Útil para SSR ou testes.
 */
export function getGreetingForHour(hour: number): GreetingResult {
  const period = getPeriodFromHour(hour)
  const config = PERIOD_CONFIG[period]

  return {
    greeting: config.greeting,
    subtext: config.subtext,
    period
  }
}
