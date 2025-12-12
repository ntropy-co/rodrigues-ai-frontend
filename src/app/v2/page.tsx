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
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-gemini-blue mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
        <p className="text-muted-foreground">
          Redirecionando para a página principal...
        </p>
      </div>
    </div>
  )
}
