import { CPRSimulator } from '@/components/v2/CPRSimulator/CPRSimulator'

export default function CPRSimulatorPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Simulador de CPR</h1>
          <p className="text-muted-foreground">Ferramenta para cálculo rápido de custos e taxas de CPR Financeira.</p>
      </div>
      <CPRSimulator />
    </div>
  )
}
