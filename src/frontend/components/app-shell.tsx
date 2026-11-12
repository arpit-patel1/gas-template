import { useEffect, useState, type ReactNode } from 'react'
import {
  HomeIcon,
  MenuIcon,
  NotebookPenIcon,
  SearchIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHello } from '@/lib/use-hello'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

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

function Brand() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        G
      </span>
      GAS Portal
    </div>
  )
}

function NavList({ page, onNavigate }: Pick<Props, 'page' | 'onNavigate'>) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          aria-current={page === id ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
            page === id && 'bg-primary/10 text-primary hover:bg-primary/10',
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </nav>
  )
}

export function AppShell({ page, onNavigate, children }: Props) {
  const { hello } = useHello()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const email = hello?.email ?? ''
  const initial = (email[0] ?? 'G').toUpperCase()
  const current = NAV.find((n) => n.id === page)!

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
    setMenuOpen(false)
    setCmdOpen(false)
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r bg-card/50 p-4 md:flex">
        <Brand />
        <NavList page={page} onNavigate={go} />
        <p className="mt-auto text-xs text-muted-foreground">
          Apps Script · Sheets
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </Button>
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>GAS Portal</BreadcrumbItem>
              <span aria-hidden className="text-muted-foreground">
                /
              </span>
              <BreadcrumbItem>
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setCmdOpen(true)}
            >
              <SearchIcon />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded border bg-muted px-1.5 text-[10px] sm:inline">
                ⌘K
              </kbd>
            </Button>
            <ThemeToggle />
            <Separator orientation="vertical" className="mx-1 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account"
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{initial}</AvatarFallback>
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
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 gap-6 p-4">
          <SheetHeader className="p-0">
            <SheetTitle>
              <Brand />
            </SheetTitle>
            <SheetDescription className="sr-only">Navigation</SheetDescription>
          </SheetHeader>
          <NavList page={page} onNavigate={go} />
        </SheetContent>
      </Sheet>

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
