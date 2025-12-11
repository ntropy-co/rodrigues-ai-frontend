import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticação | Verity Agro',
  description: 'Acesso seguro à plataforma Verity Agro'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
