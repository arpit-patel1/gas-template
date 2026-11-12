import { useState } from 'react'
import { AppShell, type PageId } from '@/components/app-shell'
import { HomePage } from '@/pages/home'
import { NotesPage } from '@/pages/notes'

// No router: Apps Script can't serve deep URLs, so pages are plain state.
const App = () => {
  const [page, setPage] = useState<PageId>('home')
  return (
    <AppShell page={page} onNavigate={setPage}>
      {page === 'home' ? <HomePage /> : <NotesPage />}
    </AppShell>
  )
}

export default App
