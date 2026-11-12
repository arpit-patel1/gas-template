import type { ReactNode } from 'react'
import { HomeIcon, NotebookPenIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'

export type PageId = 'home' | 'notes'

const NAV: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'notes', label: 'Notes', icon: NotebookPenIcon },
]

type Props = {
  page: PageId
  onNavigate: (p: PageId) => void
  children: ReactNode
}

export function AppShell({ page, onNavigate, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            G
          </span>
          GAS Portal
        </div>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <nav className="flex gap-1 border-b p-2 md:w-52 md:flex-col md:border-r md:border-b-0 md:p-3">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                page === id && 'bg-accent text-accent-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
