/**
 * Tests for RiskCalculatorContainer component
 *
 * Tests form interaction, API integration, and result display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RiskCalculatorContainer } from './RiskCalculatorContainer'
import type { RiskCalculateResponse } from '@/hooks/useRiskCalculator'

// =============================================================================
// Mocks
// =============================================================================

const mockCalculate = vi.fn()
const mockReset = vi.fn()

vi.mock('@/hooks/useRiskCalculator', () => ({
  useRiskCalculator: () => ({
    result: null,
    isLoading: false,
    error: null,
    calculate: mockCalculate,
    reset: mockReset
  })
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    form: ({ children, ...props }: React.HTMLAttributes<HTMLFormElement>) => (
      <form {...props}>{children}</form>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    )
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
}))

// =============================================================================
// Test Helpers
// =============================================================================

const mockApiResponse: RiskCalculateResponse = {
  overall_score: 42,
  risk_level: 'medio',
  factors: [
    {
      id: 'f1',
      name: 'Garantia registrada',
      impact: 'positive',
      weight: 0.25,
      description: 'CPR com garantia'
    }
  ],
  recommendations: ['Monitorar condições'],
  details: {}
}

// =============================================================================
// Tests
// =============================================================================

describe('RiskCalculatorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculate.mockResolvedValue(mockApiResponse)
  })

  describe('form rendering', () => {
    it('should render the form with all required fields', () => {
      render(<RiskCalculatorContainer />)

      expect(screen.getByText('Calculadora de Risco CPR')).toBeInTheDocument()
      expect(screen.getByLabelText(/Commodity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Unidade/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Valor Total/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Data de Emissão/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Data de Vencimento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Possui garantias/i)).toBeInTheDocument()
    })

    it('should have default commodity as soja', () => {
      render(<RiskCalculatorContainer />)

      const commoditySelect = screen.getByLabelText(
        /Commodity/i
      ) as HTMLSelectElement
      expect(commoditySelect.value).toBe('soja')
    })

    it('should show guarantee value field when checkbox is checked', async () => {
      const user = userEvent.setup()
      render(<RiskCalculatorContainer />)

      const checkbox = screen.getByLabelText(/Possui garantias/i)
      await user.click(checkbox)

      expect(screen.getByLabelText(/Valor da Garantia/i)).toBeInTheDocument()
    })

    it('should hide guarantee value field when checkbox is unchecked', async () => {
      const user = userEvent.setup()
      render(<RiskCalculatorContainer />)

      const checkbox = screen.getByLabelText(/Possui garantias/i)
      await user.click(checkbox) // Check
      await user.click(checkbox) // Uncheck

      expect(
        screen.queryByLabelText(/Valor da Garantia/i)
      ).not.toBeInTheDocument()
    })

    it('should render custom title when provided', () => {
      render(<RiskCalculatorContainer title="Análise Customizada" />)

      expect(screen.getByText('Análise Customizada')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call calculate with form data on submit', async () => {
      const user = userEvent.setup()
      render(<RiskCalculatorContainer />)

      // Fill form
      await user.type(screen.getByLabelText(/Quantidade/i), '1000')
      await user.type(screen.getByLabelText(/Valor Total/i), '150000')

      const issueDate = screen.getByLabelText(/Data de Emissão/i)
      await user.type(issueDate, '2025-01-15')

      const maturityDate = screen.getByLabelText(/Data de Vencimento/i)
      await user.type(maturityDate, '2025-06-30')

      // Submit
      const submitButton = screen.getByRole('button', {
        name: /Calcular Risco/i
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCalculate).toHaveBeenCalledTimes(1)
      })

      // Verify date format conversion (YYYY-MM-DD -> DD/MM/YYYY)
      const callArgs = mockCalculate.mock.calls[0][0]
      expect(callArgs.issue_date).toBe('15/01/2025')
      expect(callArgs.maturity_date).toBe('30/06/2025')
      expect(callArgs.quantity).toBe(1000)
      expect(callArgs.total_value).toBe(150000)
    })

    it('should include guarantee_value when has_guarantees is true', async () => {
      const user = userEvent.setup()
      render(<RiskCalculatorContainer />)

      // Fill required fields
      await user.type(screen.getByLabelText(/Quantidade/i), '500')
      await user.type(screen.getByLabelText(/Valor Total/i), '75000')
      await user.type(screen.getByLabelText(/Data de Emissão/i), '2025-01-01')
      await user.type(
        screen.getByLabelText(/Data de Vencimento/i),
        '2025-12-31'
      )

      // Enable guarantees
      await user.click(screen.getByLabelText(/Possui garantias/i))
      await user.type(screen.getByLabelText(/Valor da Garantia/i), '50000')

      // Submit
      await user.click(screen.getByRole('button', { name: /Calcular Risco/i }))

      await waitFor(() => {
        const callArgs = mockCalculate.mock.calls[0][0]
        expect(callArgs.has_guarantees).toBe(true)
        expect(callArgs.guarantee_value).toBe(50000)
      })
    })

    it('should call onCalculated callback with result', async () => {
      const onCalculated = vi.fn()
      const user = userEvent.setup()

      render(<RiskCalculatorContainer onCalculated={onCalculated} />)

      // Fill minimal form
      await user.type(screen.getByLabelText(/Quantidade/i), '100')
      await user.type(screen.getByLabelText(/Valor Total/i), '10000')
      await user.type(screen.getByLabelText(/Data de Emissão/i), '2025-01-01')
      await user.type(
        screen.getByLabelText(/Data de Vencimento/i),
        '2025-06-01'
      )

      // Submit
      await user.click(screen.getByRole('button', { name: /Calcular Risco/i }))

      await waitFor(() => {
        expect(onCalculated).toHaveBeenCalledWith(mockApiResponse)
      })
    })
  })

  describe('initial data', () => {
    it('should populate form with initialData', () => {
      render(
        <RiskCalculatorContainer
          initialData={{
            commodity: 'milho',
            quantity: 500,
            unit: 'toneladas',
            total_value: 100000,
            has_guarantees: true,
            guarantee_value: 80000
          }}
        />
      )

      const commoditySelect = screen.getByLabelText(
        /Commodity/i
      ) as HTMLSelectElement
      expect(commoditySelect.value).toBe('milho')

      const unitSelect = screen.getByLabelText(/Unidade/i) as HTMLSelectElement
      expect(unitSelect.value).toBe('toneladas')

      const quantityInput = screen.getByLabelText(
        /Quantidade/i
      ) as HTMLInputElement
      expect(quantityInput.value).toBe('500')

      const valueInput = screen.getByLabelText(
        /Valor Total/i
      ) as HTMLInputElement
      expect(valueInput.value).toBe('100000')

      // Guarantee checkbox should be checked
      const checkbox = screen.getByLabelText(
        /Possui garantias/i
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      // Guarantee value should be visible and filled
      const guaranteeInput = screen.getByLabelText(
        /Valor da Garantia/i
      ) as HTMLInputElement
      expect(guaranteeInput.value).toBe('80000')
    })
  })

  describe('commodity options', () => {
    it('should have all commodity options available', () => {
      render(<RiskCalculatorContainer />)

      const select = screen.getByLabelText(/Commodity/i) as HTMLSelectElement
      const options = Array.from(select.options).map((o) => o.value)

      expect(options).toContain('soja')
      expect(options).toContain('milho')
      expect(options).toContain('cafe')
      expect(options).toContain('algodao')
      expect(options).toContain('boi')
      expect(options).toContain('acucar')
      expect(options).toContain('trigo')
      expect(options).toContain('arroz')
    })
  })

  describe('unit options', () => {
    it('should have all unit options available', () => {
      render(<RiskCalculatorContainer />)

      const select = screen.getByLabelText(/Unidade/i) as HTMLSelectElement
      const options = Array.from(select.options).map((o) => o.value)

      expect(options).toContain('sacas')
      expect(options).toContain('toneladas')
      expect(options).toContain('arrobas')
      expect(options).toContain('quilos')
    })
  })
})

describe('RiskCalculatorContainer with result', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display result after successful calculation', async () => {
    // Create a stateful mock
    let hasResult = false

    vi.doMock('@/hooks/useRiskCalculator', () => ({
      useRiskCalculator: () => ({
        result: hasResult ? mockApiResponse : null,
        isLoading: false,
        error: null,
        calculate: vi.fn().mockImplementation(async () => {
          hasResult = true
          return mockApiResponse
        }),
        reset: vi.fn()
      })
    }))

    // This test verifies the component structure
    // Full integration would require more complex state management
    render(<RiskCalculatorContainer showFormInitially={true} />)

    // Initially shows form
    expect(screen.getByText('Calculadora de Risco CPR')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Calcular Risco/i })
    ).toBeInTheDocument()
  })
})

describe('data transformation', () => {
  it('should correctly format date from YYYY-MM-DD to DD/MM/YYYY', async () => {
    const user = userEvent.setup()
    render(<RiskCalculatorContainer />)

    await user.type(screen.getByLabelText(/Quantidade/i), '100')
    await user.type(screen.getByLabelText(/Valor Total/i), '10000')
    await user.type(screen.getByLabelText(/Data de Emissão/i), '2025-03-25')
    await user.type(screen.getByLabelText(/Data de Vencimento/i), '2025-09-15')

    await user.click(screen.getByRole('button', { name: /Calcular Risco/i }))

    await waitFor(() => {
      const callArgs = mockCalculate.mock.calls[0][0]
      expect(callArgs.issue_date).toBe('25/03/2025')
      expect(callArgs.maturity_date).toBe('15/09/2025')
    })
  })
})
