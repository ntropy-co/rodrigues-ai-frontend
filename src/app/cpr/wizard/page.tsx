'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { InternalHeader } from '@/components/layout/InternalHeader'

import { TourTrigger } from '@/features/tour'
import { TourStep } from '@/contexts/TourContext'

const WIZARD_STEPS: TourStep[] = [
  {
    id: 'wizard-intro',
    title: 'Wizard de Emissão',
    message:
      'Esta ferramenta guia você na criação de uma CPR juridicamente válida. Preencha os formulários sequenciais.',
    actionLabel: 'Entendi'
  },
  {
    id: 'wizard-validation',
    title: 'Validação Automática',
    message:
      'Nossa IA verifica dados de produtores, fazendas e garantias em tempo real contra bases públicas (CAR, Incra).'
  },
  {
    id: 'wizard-sign',
    title: 'Assinatura',
    message:
      'Ao final, o documento será enviado automaticamente para assinatura digital via DocuSign.',
    actionLabel: 'Começar'
  }
]

const CPRWizard = dynamic(
  () => import('@/features/cpr').then((mod) => mod.CPRWizard),
  {
    loading: () => <Skeleton className="h-[600px] w-full rounded-xl" />,
    ssr: false // Wizard is client-heavy and likely behind auth/interaction
  }
)

export default function CPRWizardPage() {
  return (
    <div className="min-h-screen">
      <InternalHeader
        title="Emissao de CPR"
        subtitle="Preencha os dados para gerar a CPR."
        backHref="/chat"
        containerClassName="max-w-5xl"
        actions={
          <TourTrigger
            tourId="cpr_wizard_v1"
            steps={WIZARD_STEPS}
            variant="button"
            className="hidden sm:inline-flex"
          />
        }
      />
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <CPRWizard />
      </div>
    </div>
  )
}
