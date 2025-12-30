import { CPRSimulator } from '@/components/v2/CPRSimulator/CPRSimulator'

export default function CPRSimulatorPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Simulador de CPR
        </h1>
        <p className="text-muted-foreground">
          Ferramenta para cálculo rápido de custos e taxas de CPR Financeira.
        </p>
      </div>
      <CPRSimulator />
    </div>
  )
}
