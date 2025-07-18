import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Z-Clinic - Sistema de Atendimento Virtual',
  description: 'Sistema integrado de atendimento virtual para clínica odontológica',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
