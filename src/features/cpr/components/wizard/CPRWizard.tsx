'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CPRWizardData } from './schema'
import { StepProdutor } from './steps/StepProdutor'
import { StepPropriedade } from './steps/StepPropriedade'
import { StepCultura } from './steps/StepCultura'
import { StepValues } from './steps/StepValues'
import { StepGuarantees } from './steps/StepGuarantees'
import { StepReview } from './steps/StepReview'
import { mapDraftToWizardData, mapWizardDataToDraft } from './mapping'
import { useCPRCreation } from '@/features/cpr'
import { cn } from '@/lib/utils'

// =============================================================================
// Main Component
// =============================================================================

const STEPS = [
  { id: 1, title: 'Produtor' },
  { id: 2, title: 'Propriedade' },
  { id: 3, title: 'Cultura' },
  { id: 4, title: 'Valores' },
  { id: 5, title: 'Garantias' },
  { id: 6, title: 'Revisǜo' }
]

const DRAFT_STORAGE_KEY = 'cpr_wizard_draft_id'

export function CPRWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<Partial<CPRWizardData>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const draftVersionRef = useRef<number | null>(null)

  const {
    draft,
    isSubmitting,
    error: draftError,
    createDraft,
    loadDraft,
    updateDraft,
    submitDraft,
    clearError
  } = useCPRCreation()

  useEffect(() => {
    if (draft?.version !== undefined) {
      draftVersionRef.current = draft.version
    }
  }, [draft?.version])

  useEffect(() => {
    let isActive = true

    const initDraft = async () => {
      const savedDraftId = sessionStorage.getItem(DRAFT_STORAGE_KEY)

      if (savedDraftId) {
        const loaded = await loadDraft(savedDraftId)
        if (loaded && isActive) {
          setData(mapDraftToWizardData(loaded.wizardData))
          setCurrentStep(loaded.currentStep || 1)
        }
      } else {
        const created = await createDraft(undefined, 1)
        if (created && isActive) {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, created.draftId)
        }
      }

      if (isActive) {
        setIsLoaded(true)
      }
    }

    initDraft()

    return () => {
      isActive = false
    }
  }, [createDraft, loadDraft])

  useEffect(() => {
    if (draft?.draftId) {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, draft.draftId)
    }
  }, [draft?.draftId])

  useEffect(() => {
    if (currentStep !== 6 && draftError) {
      clearError()
    }
  }, [clearError, currentStep, draftError])

  useEffect(() => {
    if (!draft?.draftId || !isLoaded || isSubmitting) {
      return
    }

    const timeoutId = setTimeout(() => {
      updateDraft(
        draft.draftId,
        mapWizardDataToDraft(data),
        currentStep,
        draftVersionRef.current ?? undefined,
        { silent: true }
      )
    }, 600)

    return () => clearTimeout(timeoutId)
  }, [currentStep, data, draft?.draftId, isLoaded, isSubmitting, updateDraft])

  const updateData = (newData: Partial<CPRWizardData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  const next = () => setCurrentStep((prev) => Math.min(prev + 1, 6))
  const back = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleGenerate = useCallback(async () => {
    const existingDraftId = draft?.draftId
    let activeDraftId = existingDraftId

    if (!activeDraftId) {
      const created = await createDraft(mapWizardDataToDraft(data), currentStep)
      if (!created) {
        return null
      }
      activeDraftId = created.draftId
      sessionStorage.setItem(DRAFT_STORAGE_KEY, created.draftId)
    }

    const updated = await updateDraft(
      activeDraftId,
      mapWizardDataToDraft(data),
      currentStep,
      draftVersionRef.current ?? undefined
    )

    if (!updated) {
      return null
    }

    return submitDraft(activeDraftId)
  }, [createDraft, currentStep, data, draft?.draftId, submitDraft, updateDraft])

  return (
    <div className="mx-auto w-full max-w-4xl rounded-lg border bg-background shadow-sm">
      {/* Header / Stepper */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold">Nova CPR Financeira</h1>
        <div className="mt-6">
          <div className="relative flex items-center justify-between">
            {/* Progress Bar Background */}
            <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-muted" />
            {/* Progress Bar Fill */}
            <div
              className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-primary transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`
              }}
            />

            {STEPS.map((step) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center bg-background px-2"
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
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive
                        ? 'scale-110 border-primary bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'cursor-pointer border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'cursor-not-allowed border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {step.id}
                  </button>
                  <span
                    className={cn(
                      'mt-2 hidden text-[10px] font-medium uppercase tracking-wider sm:block',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px] p-6">
        {!isLoaded ? (
          <div className="flex h-full items-center justify-center">
            Carregando...
          </div>
        ) : (
          <>
            {currentStep === 1 && (
              <StepProdutor data={data} updateData={updateData} onNext={next} />
            )}
            {currentStep === 2 && (
              <StepPropriedade
                data={data}
                updateData={updateData}
                onNext={next}
                onBack={back}
              />
            )}
            {currentStep === 3 && (
              <StepCultura
                data={data}
                updateData={updateData}
                onNext={next}
                onBack={back}
              />
            )}

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
                onGenerate={handleGenerate}
                isGenerating={isSubmitting}
                cprError={draftError}
                onClearError={clearError}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
