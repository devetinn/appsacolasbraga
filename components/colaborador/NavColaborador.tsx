'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotaoLogout } from '@/components/ui/BotaoLogout'

const LINKS = [
  { href: '/colaborador', label: 'Início' },
  { href: '/colaborador/historico', label: 'Histórico' },
]

export function NavColaborador() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 text-sm">
      {LINKS.map(({ href, label }) => {
        const ativo = href === '/colaborador' ? pathname === '/colaborador' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={ativo
              ? 'font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5'
              : 'text-gray-600 hover:text-gray-900'}
          >
            {label}
          </Link>
        )
      })}
      <BotaoLogout />
    </nav>
  )
}
