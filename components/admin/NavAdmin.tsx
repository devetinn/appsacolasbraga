'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotaoLogout } from '@/components/ui/BotaoLogout'

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/lancamentos', label: 'Lançamentos' },
  { href: '/admin/quinzena', label: 'Quinzena' },
  { href: '/admin/pagamentos', label: 'Pagamentos' },
  { href: '/admin/configuracoes', label: 'Config' },
]

export function NavAdmin() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 text-sm">
      {LINKS.map(({ href, label }) => {
        const ativo = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
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
