'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function V2() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página principal, já que V2 agora é a versão oficial
    router.replace('/')
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-gemini-blue border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecionando para a página principal...</p>
      </div>
    </div>
  )
}