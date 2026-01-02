import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações | Verity Agro',
  description: 'Gerencie as configurações da sua organização'
}

import { WelcomeTour } from '@/features/tour'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <WelcomeTour />
      {children}
    </>
  )
}
