import { CPRSimulator } from '@/features/cpr'
import { InternalHeader } from '@/components/layout/InternalHeader'

export default function CPRSimulatorPage() {
  return (
    <div className="min-h-screen">
      <InternalHeader
        title="Simulador de CPR"
        subtitle="Calculo rapido de custos e taxas de CPR financeira."
        backHref="/chat"
        containerClassName="max-w-5xl"
      />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <CPRSimulator />
      </div>
    </div>
  )
}
