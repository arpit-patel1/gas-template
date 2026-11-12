import { beforeEach, expect, test, vi } from 'vitest'
import { addSheet, getSheetsData } from './sheets'

const makeSheet = (name: string) => ({ getName: () => name, activate: vi.fn() })

beforeEach(() => {
  const sheets = [makeSheet('Sheet1')]
  const ss = {
    getActiveSheet: () => sheets[0],
    getSheets: () => sheets,
    insertSheet: (title: string) => sheets.push(makeSheet(title)),
  }
  vi.stubGlobal('SpreadsheetApp', { getActive: () => ss })
})

test('getSheetsData marks the active sheet', () => {
  expect(getSheetsData()).toEqual([{ name: 'Sheet1', index: 0, isActive: true }])
})

test('addSheet returns the updated list', () => {
  expect(addSheet('Data').map((s) => s.name)).toEqual(['Sheet1', 'Data'])
})
