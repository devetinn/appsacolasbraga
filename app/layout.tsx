import type { Metadata } from 'next'
import { Roboto_Slab, DM_Sans } from 'next/font/google'
import './globals.css'

const display = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
})

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Sacolas Braga',
  description: 'Sistema de Gestão de Produção',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased bg-brand-cream`}>
        {children}
      </body>
    </html>
  )
}
