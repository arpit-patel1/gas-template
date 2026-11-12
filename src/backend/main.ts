import {
  getHello,
  listNotes,
  addNote,
  updateNote,
  deleteNote,
} from './serverFunctions'

declare const global: {
  [x: string]: unknown
}

// Serves the web app (the inlined React build).
global.doGet = (): GoogleAppsScript.HTML.HtmlOutput =>
  HtmlService.createHtmlOutputFromFile('dist/index.html')
    .setTitle('GAS Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)

// Every function the client calls via gas-client must be exposed on `global`.
global.getHello = getHello
global.listNotes = listNotes
global.addNote = addNote
global.updateNote = updateNote
global.deleteNote = deleteNote
