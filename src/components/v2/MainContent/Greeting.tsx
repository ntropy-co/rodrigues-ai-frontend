'use client'

import { useState, useEffect } from 'react'

export function Greeting() {
  const [greeting, setGreeting] = useState('')

  const getGreetingMessage = () => {
    const hour = new Date().getHours()

    if (hour >= 0 && hour < 6) return 'Boa madrugada'
    if (hour >= 6 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  useEffect(() => {
    setGreeting(getGreetingMessage())
  }, [])

  return (
    <div className="mb-12 text-center">
      <h1 className="text-3xl font-normal text-gemini-blue md:text-4xl lg:text-5xl">
        {greeting}
      </h1>
      <p className="mt-2 text-lg text-gemini-gray-600 md:text-xl">
        Como posso ajudar com suas questões de crédito rural e CPR hoje?
      </p>
    </div>
  )
}