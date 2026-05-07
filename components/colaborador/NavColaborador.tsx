'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Plus } from 'lucide-react'

const LINKS = [
  { href: '/colaborador',           label: 'Início',    icon: Home },
  { href: '/colaborador/registrar', label: 'Registrar', icon: Plus },
  { href: '/colaborador/historico', label: 'Histórico', icon: Calendar },
]

export function NavColaborador() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-black/[0.06] px-2 pt-2 pb-6 z-40">
      <div className="flex justify-around max-w-lg mx-auto">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const ativo = href === '/colaborador'
            ? pathname === '/colaborador'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-2xl transition-all ${
                ativo ? 'text-brand-blue' : 'text-brand-dark/35 hover:text-brand-dark/60'
              }`}
            >
              <div className={`p-2.5 rounded-2xl transition-all ${
                ativo ? 'bg-brand-blue/10' : ''
              }`}>
                <Icon
                  size={20}
                  strokeWidth={ativo ? 2.5 : 1.75}
                />
              </div>
              <span className={`text-[10px] font-sans font-semibold tracking-wide ${
                ativo ? 'text-brand-blue' : 'text-brand-dark/35'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
