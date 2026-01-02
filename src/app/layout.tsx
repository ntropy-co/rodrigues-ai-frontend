import type { Metadata, Viewport } from 'next'
import {
  DM_Mono,
  Geist,
  Inter,
  Playfair_Display,
  Crimson_Pro
} from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatInputProvider } from '@/contexts/ChatInputContext'
import { PostHogProvider } from '@/components/providers/PostHogProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { InstallPrompt } from '@/components/v2/InstallPrompt'
import { QueryProvider } from '@/providers/QueryProvider'
import { WebVitalsReporterWrapper } from '@/components/v2/Monitoring/WebVitalsReporterWrapper'
import { TourProvider } from '@/contexts/TourContext'
import { TourOverlay } from '@/components/v2/Tour/TourOverlay'
import { VerityGuide } from '@/components/v2/Tour/VerityGuide'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap'
})

const crimson = Crimson_Pro({
  variable: '--font-crimson',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap'
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  weight: '400',
  subsets: ['latin']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: '400'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permitir zoom para acessibilidade
  userScalable: true,
  viewportFit: 'cover', // iOS notch/dynamic island support
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

export const metadata: Metadata = {
  title: 'Verity Agro - Especialista em Crédito Agro e CPR',
  description:
    'Consulte o Verity Agro, especialista em crédito agrícola e CPR (Cédula de Produto Rural). Obtenha orientações especializadas sobre financiamento rural, instrumentos de crédito e mercado agropecuário.',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icon-192.png',
    shortcut: '/icon-192.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${crimson.variable} ${geistSans.variable} ${dmMono.variable} bg-sand-100 font-sans text-verity-900 antialiased selection:bg-verity-200 selection:text-verity-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <PostHogProvider>
            <AuthProvider>
              <ChatInputProvider>
                <TourProvider>
                  <QueryProvider>
                    <ErrorBoundary>
                      <NuqsAdapter>{children}</NuqsAdapter>
                    </ErrorBoundary>
                    <Toaster />
                    <InstallPrompt />
                    <WebVitalsReporterWrapper />
                    <TourOverlay />
                    <VerityGuide />
                  </QueryProvider>
                </TourProvider>
              </ChatInputProvider>
            </AuthProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
