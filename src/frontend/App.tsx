import { useState } from 'react'
import { AppShell, type PageId } from '@/components/app-shell'
import { HelloProvider } from '@/lib/hello-context'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { HomePage } from '@/pages/home'
import { NotesPage } from '@/pages/notes'

// No router: Apps Script can't serve deep URLs, so pages are plain state.
const App = () => {
  const [page, setPage] = useState<PageId>('home')
  return (
    <TooltipProvider>
      <HelloProvider>
        <AppShell page={page} onNavigate={setPage}>
          {page === 'home' ? <HomePage onNavigate={setPage} /> : <NotesPage />}
        </AppShell>
        <Toaster richColors position="top-center" />
      </HelloProvider>
    </TooltipProvider>
  )
}

export default App
