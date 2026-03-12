'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, TrendingUp, Apple, User } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { name: 'Entreno', href: '/workout', icon: Dumbbell },
  { name: 'Progreso', href: '/history', icon: TrendingUp },
  { name: 'Nutrición', href: '/nutrition', icon: Apple },
  { name: 'Perfil', href: '/profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-zinc-800 bg-zinc-950/90 pb-safe pt-2 backdrop-blur-lg">
      <ul className="flex items-center justify-around px-2 pb-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <li key={item.name} className="flex-1">
              <Link
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 p-2 transition-colors',
                  isActive ? 'text-green-500' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
