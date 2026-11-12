import { useEffect, useState, type ReactNode } from 'react'
import {
  HomeIcon,
  NotebookPenIcon,
  SearchIcon,
  type LucideIcon,
} from 'lucide-react'
import { brand } from '@/brand'
import { Monogram } from '@/components/monogram'
import { cn } from '@/lib/utils'
import { useHello } from '@/lib/use-hello'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const { hello } = useHello()
  const [cmdOpen, setCmdOpen] = useState(false)
  const email = hello?.email ?? ''
  const initial = (email[0] ?? 'G').toUpperCase()

  // Cmd/Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (p: PageId) => {
    onNavigate(p)
    setCmdOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
        <Monogram className="size-8" />
        <div className="leading-tight">
          <p className="font-heading text-lg font-semibold">{brand.name}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {brand.tagline}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setCmdOpen(true)}
          >
            <SearchIcon />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-sm border bg-muted px-1.5 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Account"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block text-xs font-normal text-muted-foreground">
                  Signed in as
                </span>
                {email || 'unknown'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NAV.map(({ id, label, icon: Icon }) => (
                <DropdownMenuItem key={id} onSelect={() => go(id)}>
                  <Icon /> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">{children}</main>

      {/* Pages are tabs, like the bottom strip of a spreadsheet. */}
      <footer className="sticky bottom-0 z-10 flex h-10 items-stretch border-t bg-card">
        <nav className="flex items-stretch" aria-label="Pages">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              aria-current={page === id ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 border-r border-t-2 border-t-transparent px-4 text-sm text-muted-foreground transition-colors hover:bg-accent',
                page === id &&
                  'border-t-primary bg-background font-medium text-foreground hover:bg-background',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <p className="ml-auto hidden items-center truncate px-4 sm:flex text-xs text-muted-foreground">
          {hello ? `Connected to ${hello.spreadsheet}` : 'Connecting…'}
        </p>
      </footer>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Go to…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            {NAV.map(({ id, label, icon: Icon }) => (
              <CommandItem key={id} onSelect={() => go(id)}>
                <Icon /> {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
