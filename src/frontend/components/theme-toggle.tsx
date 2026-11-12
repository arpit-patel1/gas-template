import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const KEY = 'theme'

const initialDark = () => {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return saved === 'dark'
  } catch {
    // storage can be unavailable inside the Apps Script iframe
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  const [dark, setDark] = useState(initialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
