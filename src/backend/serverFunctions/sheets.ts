// Adapted from enuchi/React-Google-Apps-Script (MIT).
// NOTE: SpreadsheetApp.getActive() only works when the script is bound to a spreadsheet
// (create it with `clasp create --type sheets`). For a standalone script, use
// SpreadsheetApp.openById(<id>) instead.

export type SheetInfo = { name: string; index: number; isActive: boolean }

const getSpreadsheet = () => SpreadsheetApp.getActive()

export const getSheetsData = (): SheetInfo[] => {
  const ss = getSpreadsheet()
  const activeName = ss.getActiveSheet().getName()
  return ss.getSheets().map((sheet, index) => {
    const name = sheet.getName()
    return { name, index, isActive: name === activeName }
  })
}

export const addSheet = (title: string): SheetInfo[] => {
  getSpreadsheet().insertSheet(title)
  return getSheetsData()
}

export const deleteSheet = (index: number): SheetInfo[] => {
  const ss = getSpreadsheet()
  ss.deleteSheet(ss.getSheets()[index])
  return getSheetsData()
}

export const setActiveSheet = (name: string): SheetInfo[] => {
  getSpreadsheet().getSheetByName(name)?.activate()
  return getSheetsData()
}
