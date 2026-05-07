'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotaoLogout } from '@/components/ui/BotaoLogout'

const LINKS = [
  { href: '/admin',               label: 'Dashboard' },
  { href: '/admin/lancamentos',   label: 'Lançamentos' },
  { href: '/admin/quinzena',      label: 'Quinzena' },
  { href: '/admin/pagamentos',    label: 'Pagamentos' },
  { href: '/admin/configuracoes', label: 'Config' },
]

export function NavAdmin() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, label }) => {
        const ativo = href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition-all ${
              ativo
                ? 'bg-brand-blue text-white shadow-sm shadow-brand-blue/25'
                : 'text-brand-dark/45 hover:text-brand-dark hover:bg-black/5'
            }`}
          >
            {label}
          </Link>
        )
      })}
      <div className="ml-3 pl-3 border-l border-black/10">
        <BotaoLogout />
      </div>
    </nav>
  )
}
