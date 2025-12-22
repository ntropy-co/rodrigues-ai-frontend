'use client'

import React, { useState, useEffect } from 'react'
import { CPRWizardData, cprWizardSchema } from './schema'
import { StepValues } from './steps/StepValues'
import { StepGuarantees } from './steps/StepGuarantees'
import { StepReview } from './steps/StepReview'
import { cn } from '@/lib/utils'

// =============================================================================
// Placeholder Steps (1-3)
// =============================================================================

function PlaceholderStep({ title, step, onNext }: { title: string; step: number; onNext: () => void }) {
  return (
    <div className="space-y-4 py-8 text-center animate-in fade-in">
       <div className="text-muted-foreground text-sm uppercase tracking-wide">Step {step} (Placeholder)</div>
       <h3 className="text-xl font-semibold">{title}</h3>
       <p className="text-sm text-muted-foreground max-w-md mx-auto">
         Este passo já foi implementado anteriormente ou é apenas ilustrativo para este fluxo.
       </p>
       <button 
         onClick={onNext}
         className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
       >
         Simular Conclusão e Avançar
       </button>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

const STEPS = [
  { id: 1, title: 'Produtor' },
  { id: 2, title: 'Propriedade' },
  { id: 3, title: 'Cultura' },
  { id: 4, title: 'Valores' },
  { id: 5, title: 'Garantias' },
  { id: 6, title: 'Revisão' }
]

export function CPRWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<Partial<CPRWizardData>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Persist State
  useEffect(() => {
    const saved = localStorage.getItem('cpr_wizard_state')
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load wizard state', e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
       localStorage.setItem('cpr_wizard_state', JSON.stringify(data))
    }
  }, [data, isLoaded])

  const updateData = (newData: Partial<CPRWizardData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const next = () => setCurrentStep(prev => Math.min(prev + 1, 6))
  const back = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="w-full max-w-4xl mx-auto bg-background rounded-lg border shadow-sm">
      {/* Header / Stepper */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">Nova CPR Financeira</h1>
        <div className="mt-6">
           <div className="flex items-center justify-between relative">
              {/* Progress Bar Background */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
              {/* Progress Bar Fill */}
              <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300" 
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />

              {STEPS.map((step) => {
                 const isActive = step.id === currentStep
                 const isCompleted = step.id < currentStep
                  return (
                   <div 
                     key={step.id} 
                     className="flex flex-col items-center bg-background px-2 relative z-10"
                     aria-current={isActive ? 'step' : undefined}
                   >
                      <button
                        onClick={() => {
                          // Allow jumping back to completed steps or current step
                          if (step.id < currentStep) {
                            setCurrentStep(step.id)
                          }
                        }}
                        disabled={step.id > currentStep}
                        className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive ? "border-primary bg-primary text-primary-foreground scale-110" :
                        isCompleted ? "border-primary bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90" :
                        "border-muted-foreground/30 text-muted-foreground cursor-not-allowed"
                      )}>
                        {step.id}
                      </button>
                      <span className={cn(
                        "text-[10px] mt-2 font-medium uppercase tracking-wider hidden sm:block",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </span>
                   </div>
                 )
              })}
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[400px]">
        {!isLoaded ? (
            <div className="flex items-center justify-center h-full">Carregando...</div>
        ) : (
            <>
                {currentStep === 1 && <PlaceholderStep title="Identificação do Produtor" step={1} onNext={next} />}
                {currentStep === 2 && <PlaceholderStep title="Seleção da Propriedade" step={2} onNext={next} />}
                {currentStep === 3 && <PlaceholderStep title="Definição da Cultura" step={3} onNext={next} />}
                
                {currentStep === 4 && (
                    <StepValues 
                        data={data} 
                        updateData={updateData} 
                        onNext={next} 
                        onBack={back} 
                    />
                )}

                {currentStep === 5 && (
                    <StepGuarantees 
                        data={data} 
                        updateData={updateData} 
                        onNext={next} 
                        onBack={back} 
                    />
                )}

                {currentStep === 6 && (
                    <StepReview 
                        data={data} 
                        onBack={back} 
                        goToStep={(s) => setCurrentStep(s)}
                    />
                )}
            </>
        )}
      </div>
    </div>
  )
}
