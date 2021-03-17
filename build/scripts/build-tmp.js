import ImportPosition from '../../src/electron/import/ImportPosition.js'
import fs from 'fs'

const data = JSON.parse(fs.readFileSync('/home/vioi/dev/imports/sketch/test/.desech/sketch-import.json'))
ImportPosition.buildStructure(data.html.index.nodes, data.css)
// clear && node ~/dev/desech-studio/build/scripts/build-tmp.js
