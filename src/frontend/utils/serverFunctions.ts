import { GASClient } from 'gas-client'
import type * as publicServerFunctions from '../../backend/serverFunctions'
import type { SheetInfo } from '../../backend/serverFunctions'

// Pattern adapted from enuchi/React-Google-Apps-Script (MIT).
const gas = new GASClient<typeof publicServerFunctions>()

// Local `npm run dev` has no Apps Script runtime, so use an in-memory mock.
let mockSheets: SheetInfo[] = [
  { name: 'Sheet1', index: 0, isActive: true },
  { name: 'Data', index: 1, isActive: false },
]
const reindex = (list: SheetInfo[]) => list.map((s, index) => ({ ...s, index }))
const mock = {
  getSheetsData: async () => mockSheets,
  addSheet: async (name: string) =>
    (mockSheets = reindex([...mockSheets, { name, index: 0, isActive: false }])),
  deleteSheet: async (index: number) =>
    (mockSheets = reindex(mockSheets.filter((_, i) => i !== index))),
  setActiveSheet: async (name: string) =>
    (mockSheets = mockSheets.map((s) => ({ ...s, isActive: s.name === name }))),
}

export const serverFunctions = import.meta.env.DEV
  ? mock
  : gas.serverFunctions
