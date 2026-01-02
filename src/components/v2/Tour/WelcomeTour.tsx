'use client'

import { useEffect } from 'react'
import { useTour, TourStep } from '@/contexts/TourContext'
import { useAuth } from '@/contexts/AuthContext'

export const WELCOME_STEPS: TourStep[] = [
  {
    id: 'welcome-intro',
    title: 'Bem-vindo ao Verity Agro',
    message:
      'Sua plataforma definitiva de inteligência financeira para o campo. Eu sou a Verity, sua analista pessoal, e vou te mostrar como aproveitar o máximo do sistema.',
    actionLabel: 'Começar Tour'
  },
  {
    id: 'dashboard-overview',
    title: 'Painel de Controle',
    message:
      'Aqui você tem uma visão completa da sua carteira. Acompanhe o status das suas CPRs, cotações de mercado e alertas importantes em tempo real.'
  },
  {
    id: 'sidebar-nav',
    title: 'Navegação Inteligente',
    message:
      'Acesse rapidamente suas ferramentas no menu lateral. Crie projetos para organizar suas conversas e mantenha o foco no que importa.'
  },
  {
    id: 'ai-chat',
    title: 'Inteligência Artificial',
    message:
      'Precisa analisar um documento ou tirar uma dúvida jurídica? Chame a IA a qualquer momento. Ela é treinada especificamente para o agronegócio.'
  },
  {
    id: 'finish',
    title: 'Estou pronta para ajudar',
    message:
      'Sempre que tiver dúvidas, procure pelos ícones de ajuda (?) espalhados pela plataforma. Bom trabalho!',
    actionLabel: 'Vamos lá!'
  }
]

export function WelcomeTour() {
  const { hasSeenTour, startTour, isActive } = useTour()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Only trigger if:
    // 1. Auth check is done
    // 2. User is logged in
    // 3. Tour hasn't been seen
    // 4. Tour isn't currently active
    if (!isLoading && user && !hasSeenTour('welcome_v1') && !isActive) {
      // Small delay to allow UI to settle
      const timer = setTimeout(() => {
        startTour('welcome_v1', WELCOME_STEPS)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isLoading, user, hasSeenTour, startTour, isActive])

  return null
}
