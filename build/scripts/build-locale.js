import glob from 'glob'
import fs from 'fs'
import csvStringify from 'csv-stringify/lib/sync.js'
import csvParse from 'csv-parse/lib/sync.js'
import HelperRegex from '../../src/js/helper/HelperRegex.js'
import ExtendJS from '../../src/js/helper/ExtendJS.js'

function buildLocale () {
  const data = buildJsonEn() // en.json
  convertJsonToCsv(data) // template.csv
  for (const locale of ['ro']) {
    mergeTemplateWithCsv(locale) // ro.csv
    convertCsvToJson(locale) // ro.json
  }
}

function buildJsonEn () {
  const data = ExtendJS.unique([...extractJS(), ...extractHTML()]).sort(Intl.Collator().compare)
  const object = {}
  for (const val of data) {
    object[val] = val
  }
  fs.writeFileSync('./src/electron/i18n/en.json', JSON.stringify(object, null, 2))
  return data
}

function extractJS () {
  const array = []
  for (const file of extractFiles('js')) {
    const js = fs.readFileSync(file).toString()
    const lines = extractLocalize(js,
      /Language\.localize\(['"](?<txt>[\s\S]*?)['"](,[\s\S]*?)?\)/g)
    array.push(...lines)
  }
  return array
}

function extractFiles (ext) {
  return glob.sync(`./**/*.${ext}`, {
    ignore: getIgnoredFiles(ext)
  })
}

function getIgnoredFiles (ext) {
  const array = []
  for (const dir of ['app', 'dist', 'node_modules', 'test', 'tmp']) {
    array.push(`./**/${dir}/**/*.${ext}`)
  }
  return array
}

function extractLocalize (string, regex) {
  const array = []
  const data = HelperRegex.getMatchingGroups(string, regex)
  for (const val of data) {
    array.push(val.txt.replace(/\s\s+/g, ' ').trim())
  }
  return array
}

function extractHTML () {
  const array = []
  for (const file of extractFiles('html')) {
    const js = fs.readFileSync(file).toString()
    array.push(...extractLocalize(js, /{{#i18n}}(?<txt>.*?){{\/i18n}}/gi))
  }
  return array
}

function convertJsonToCsv (data) {
  const obj = []
  for (const val of data) {
    obj.push({
      Original: val,
      Translated: null
    })
  }
  const csv = csvStringify(obj, {
    columns: ['Original', 'Translated'],
    header: true,
    quoted: true
  })
  fs.writeFileSync('./build/i18n/template.csv', csv)
}

function mergeTemplateWithCsv (locale) {
  const file = `./build/i18n/${locale}.csv`
  const templateString = fs.readFileSync('./build/i18n/template.csv').toString()
  const localeString = fs.existsSync(file) ? fs.readFileSync(file).toString() : ''
  const templateData = csvParse(templateString, { columns: true })
  const localeData = csvParse(localeString, { columns: true })

  for (let i = 0; i < templateData.length; i++) {
    for (const localeVal of localeData) {
      if (templateData[i].Original === localeVal.Original && localeVal.Translated) {
        templateData[i].Translated = localeVal.Translated
      }
    }
  }

  const csv = csvStringify(templateData, {
    columns: ['Original', 'Translated'],
    header: true,
    quoted: true
  })
  fs.writeFileSync('./build/i18n/ro.csv', csv)
}

function convertCsvToJson (locale) {
  const csv = fs.readFileSync(`./build/i18n/${locale}.csv`).toString()
  const data = csvParse(csv, { columns: true })
  const obj = {}
  for (const val of data) {
    obj[val.Original] = val.Translated || val.Original
  }
  fs.writeFileSync(`./src/electron/i18n/${locale}.json`, JSON.stringify(obj, null, 2))
}

buildLocale()
