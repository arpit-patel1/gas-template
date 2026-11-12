import {
  sampleFunction,
  getSheetsData,
  addSheet,
  deleteSheet,
  setActiveSheet,
} from './serverFunctions'

declare const global: {
  [x: string]: unknown
}

// Required to serve the web app. Pattern from labnol/apps-script-starter (MIT).
global.doGet = (): GoogleAppsScript.HTML.HtmlOutput =>
  HtmlService.createHtmlOutputFromFile('dist/index.html')
    .setTitle('GAS React Template')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)

// Every function the client calls via gas-client must be exposed on `global`.
global.sampleFunction = sampleFunction
global.getSheetsData = getSheetsData
global.addSheet = addSheet
global.deleteSheet = deleteSheet
global.setActiveSheet = setActiveSheet
