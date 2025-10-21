import type { Metadata } from 'next'
import { DM_Mono, Geist, Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
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

export const metadata: Metadata = {
  title: 'Rodrigues AI - Especialista em Crédito Agro e CPR',
  description:
    'Consulte o Rodrigues AI, especialista em crédito agrícola e CPR (Cédula de Produto Rural). Obtenha orientações especializadas sobre financiamento rural, instrumentos de crédito e mercado agropecuário.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // Permitir zoom para acessibilidade
    userScalable: true,
    viewportFit: 'cover' // iOS notch/dynamic island support
  },
  appleWebApp: {
    capable: true,
    title: 'Rodrigues AI',
    statusBarStyle: 'black-translucent'
  },
  icons: {
    icon: [{ url: '/rodrigues-icon.png', sizes: 'any', type: 'image/png' }],
    apple: '/rodrigues-icon.png',
    shortcut: '/rodrigues-icon.png'
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
        className={`${inter.variable} ${geistSans.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
