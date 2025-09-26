'use client'

export function Greeting() {
  const getGreetingMessage = () => {
    const hour = new Date().getHours()
    
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="mb-12 text-center">
      <h1 className="text-3xl font-normal text-gemini-blue md:text-4xl lg:text-5xl">
        {getGreetingMessage()}
      </h1>
      <p className="mt-2 text-lg text-gemini-gray-600 md:text-xl">
        Como posso ajudar com suas questões de crédito rural e CPR hoje?
      </p>
    </div>
  )
}