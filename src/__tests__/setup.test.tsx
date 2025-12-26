import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple smoke test to validate the testing setup works
describe('Testing Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <h1>Hello Vitest</h1>
    
    render(<TestComponent />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello Vitest')
  })

  it('should have jest-dom matchers available', () => {
    const TestComponent = () => <button disabled>Click me</button>
    
    render(<TestComponent />)
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
