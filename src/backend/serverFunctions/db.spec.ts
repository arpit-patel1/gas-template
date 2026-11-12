import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createTable, type Record_ } from './db'

type Item = { id: string; name: string; qty: number } & Record_

// Minimal in-memory fake of a Sheet.
const makeFakeSpreadsheet = () => {
  const tabs = new Map<string, unknown[][]>()
  const makeSheet = (rows: unknown[][]) => ({
    appendRow: (r: unknown[]) => rows.push(r),
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => rows.map((r) => [...r]) }),
    getRange: (row: number) => ({
      setValues: (v: unknown[][]) => {
        rows[row - 1] = v[0]
      },
    }),
    deleteRow: (n: number) => rows.splice(n - 1, 1),
  })
  return {
    getName: () => 'Test Sheet',
    getSheetByName: (n: string) =>
      tabs.has(n) ? makeSheet(tabs.get(n)!) : null,
    insertSheet: (n: string) => {
      tabs.set(n, [])
      return makeSheet(tabs.get(n)!)
    },
  }
}

beforeEach(() => {
  const ss = makeFakeSpreadsheet()
  let n = 0
  vi.stubGlobal('SpreadsheetApp', { getActive: () => ss, openById: () => ss })
  vi.stubGlobal('PropertiesService', {
    getScriptProperties: () => ({ getProperty: () => null }),
  })
  vi.stubGlobal('LockService', {
    getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }),
  })
  vi.stubGlobal('Utilities', { getUuid: () => `id-${++n}` })
})

describe('createTable', () => {
  const make = () => createTable<Item>('Items', ['id', 'name', 'qty'])

  test('starts empty, then lists added rows', () => {
    const t = make()
    expect(t.list()).toEqual([])
    t.add({ name: 'apple', qty: 2 })
    expect(t.list()).toEqual([{ id: 'id-1', name: 'apple', qty: 2 }])
  })

  test('update patches a row by id', () => {
    const t = make()
    const { id } = t.add({ name: 'apple', qty: 2 })
    t.update(id, { qty: 5 })
    expect(t.list()[0]).toEqual({ id, name: 'apple', qty: 5 })
  })

  test('remove deletes a row by id', () => {
    const t = make()
    const a = t.add({ name: 'a', qty: 1 })
    t.add({ name: 'b', qty: 1 })
    t.remove(a.id)
    expect(t.list().map((r) => r.name)).toEqual(['b'])
  })

  test('update/remove throw for unknown id', () => {
    const t = make()
    expect(() => t.update('nope', { qty: 1 })).toThrow('Row not found')
    expect(() => t.remove('nope')).toThrow('Row not found')
  })
})
