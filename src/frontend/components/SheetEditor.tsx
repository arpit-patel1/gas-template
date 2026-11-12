import { useEffect, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import type { SheetInfo } from '../../backend/serverFunctions'
import { serverFunctions } from '../utils/serverFunctions'
import FormInput from './FormInput'
import SheetButton from './SheetButton'

// Adapted from enuchi/React-Google-Apps-Script (MIT).
const SheetEditor = () => {
  const [sheets, setSheets] = useState<SheetInfo[]>([])
  const [error, setError] = useState<string | null>(null)

  const run = async (call: () => Promise<SheetInfo[]>) => {
    try {
      setSheets(await call())
      setError(null)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    run(() => serverFunctions.getSheetsData())
  }, [])

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">GAS + React + Tailwind</h1>
      <p className="mb-4 text-gray-600">
        Add a sheet name and press Enter. Click a tab to activate it, &times; to
        delete it.
      </p>
      <FormInput onSubmit={(name) => run(() => serverFunctions.addSheet(name))} />
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <TransitionGroup className="sheet-list">
        {sheets.map((sheet) => (
          <CSSTransition key={sheet.name} classNames="sheetNames" timeout={500}>
            <SheetButton
              sheet={sheet}
              onDelete={(i) => run(() => serverFunctions.deleteSheet(i))}
              onActivate={(n) => run(() => serverFunctions.setActiveSheet(n))}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}

export default SheetEditor
