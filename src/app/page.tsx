'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Shield,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect to chat if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/chat')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))]">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Rodrigues AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
              className="text-sm"
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] text-white hover:opacity-90"
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(var(--gemini-blue))]/10 to-[hsl(var(--gemini-purple))]/10 px-4 py-2 text-sm font-medium text-[hsl(var(--gemini-blue))]">
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Seu Especialista em
            <span className="bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] bg-clip-text text-transparent">
              {' '}
              Crédito Rural e CPR
            </span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Consultoria jurídica especializada em financiamento rural,
            instrumentos de crédito e mercado agropecuário. Tire suas dúvidas
            sobre CPR, crédito agrícola e muito mais.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] text-white hover:opacity-90 sm:w-auto"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              Por que escolher o Rodrigues AI?
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gemini-blue))]/10 to-[hsl(var(--gemini-purple))]/10">
                  <Shield className="h-6 w-6 text-[hsl(var(--gemini-blue))]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Especialização Jurídica
                </h3>
                <p className="text-muted-foreground">
                  Conhecimento profundo em legislação de crédito rural, CPR e
                  instrumentos financeiros do agronegócio.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gemini-blue))]/10 to-[hsl(var(--gemini-purple))]/10">
                  <MessageSquare className="h-6 w-6 text-[hsl(var(--gemini-blue))]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Respostas Instantâneas
                </h3>
                <p className="text-muted-foreground">
                  Obtenha orientações especializadas imediatamente, 24 horas por
                  dia, 7 dias por semana.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gemini-blue))]/10 to-[hsl(var(--gemini-purple))]/10">
                  <Sparkles className="h-6 w-6 text-[hsl(var(--gemini-blue))]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Tecnologia Avançada
                </h3>
                <p className="text-muted-foreground">
                  Powered by inteligência artificial de última geração para
                  análises precisas e atualizadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              O que você pode fazer
            </h2>

            <div className="space-y-4">
              {[
                'Esclarecer dúvidas sobre CPR (Cédula de Produto Rural)',
                'Entender diferentes linhas de crédito rural disponíveis',
                'Obter orientações sobre financiamento agrícola',
                'Conhecer aspectos jurídicos de contratos do agronegócio',
                'Analisar garantias e instrumentos de crédito',
                'Compreender a legislação do mercado agropecuário'
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[hsl(var(--gemini-blue))]" />
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Crie sua conta gratuitamente e comece a consultar o Rodrigues AI
              agora mesmo.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-[hsl(var(--gemini-blue))] to-[hsl(var(--gemini-purple))] text-white hover:opacity-90"
            >
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Rodrigues AI. Consultoria Jurídica Powered by AI.</p>
            <p className="mt-2">Especialista em CPR e Crédito Rural</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
