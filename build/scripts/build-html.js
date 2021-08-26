import fs from 'fs'
import fetch from 'node-fetch'
import minify from 'html-minifier'
import Template from '../../src/lib/Template.js'
import Language from '../../src/electron/lib/Language.js'
import pjson from '../../package.json'

async function buildHtml (locale) {
  global.locale = locale
  // sort the fonts by category
  const response = await fetch('https://download.desech.com/font/list.json')
  if (!response.ok) throw new Error("Can't access download.desech.com")
  const fonts = await response.json()
  // first 20 from https://fonts.google.com/?sort=popularity
  const popularCategory = [
    'Poppins',
    'Roboto',
    'Roboto Mono',
    'Roboto Slab',
    'Roboto Condensed',
    'Oswald',
    'Open Sans',
    'Open Sans Condensed',
    'Lato',
    'Lora',
    'Montserrat',
    'Source Sans Pro',
    'Raleway',
    'Noto Sans',
    'PT Sans',
    'PT Serif',
    'Merriweather',
    'Mulish',
    'Ubuntu',
    'Playfair Display'
  ]
  const popularFonts = []
  const categoryFonts = [
    {
      category: Language.localize('Serif'),
      fonts: []
    },
    {
      category: Language.localize('Sans Serif'),
      fonts: []
    },
    {
      category: Language.localize('Display'),
      fonts: []
    },
    {
      category: Language.localize('Handwriting'),
      fonts: []
    },
    {
      category: Language.localize('Monospace'),
      fonts: []
    }
  ]
  for (const font of fonts) {
    if (popularCategory.includes(font.family)) {
      popularFonts.push(getFontData(font))
    } else {
      for (const val of categoryFonts) {
        if (val.category === font.category) {
          val.fonts.push(getFontData(font))
          break
        }
      }
    }
  }

  // effects list
  const effects = {
    filter: Language.localize('Filter'),
    transform: Language.localize('Transform'),
    'drop-shadow': Language.localize('Drop shadow'),
    opacity: Language.localize('Opacity'),
    blur: Language.localize('Blur'),
    brightness: Language.localize('Brightness'),
    contrast: Language.localize('Contrast'),
    'hue-rotate': Language.localize('Hue'),
    saturate: Language.localize('Saturation'),
    grayscale: Language.localize('Grayscale'),
    sepia: Language.localize('Sepia'),
    invert: Language.localize('Invert'),
    'box-shadow': Language.localize('Box shadow'),
    perspective: Language.localize('Perspective'),
    translate3d: Language.localize('Move'),
    scale3d: Language.localize('Scale'),
    rotate: Language.localize('Rotate'),
    skew: Language.localize('Skew'),
    matrix: Language.localize('Matrix'),
    matrix3d: Language.localize('Matrix 3D'),
    transition: Language.localize('Transition'),
    'mix-blend-mode': Language.localize('Blend mode'),
    none: Language.localize('None'),
    inherit: Language.localize('Inherit'),
    initial: Language.localize('Initial'),
    unset: Language.localize('Unset')
  }

  // about details
  const about = {
    version: pjson.version,
    electron: pjson.devDependencies.electron.substring(1)
  }

  // generate the html contents
  const html = Template.getHtmlTemplate('./src/html/index.html', {
    partialDir: './src/html/partial',
    vars: {
      pageTitle: 'Desech Studio',
      about,
      popularFonts,
      categoryFonts,
      effectNames: JSON.stringify(effects)
    }
  }).replace('<html lang="">', `<html lang="${locale}">`)

  // minify the html - https://github.com/kangax/html-minifier
  const minHtml = minify.minify(html, {
    removeComments: true,
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    minifyCSS: true
  })

  // save the html file
  fs.writeFileSync(`./app/html/${locale}.html`, minHtml)
}

function getFontData (font) {
  const dir = font.family.replaceAll(' ', '+')
  return {
    family: font.family,
    url: `https://download.desech.com/font/${dir}.zip`
  }
}

function buildErrorHtml () {
  const html = fs.readFileSync('./src/html/error.html').toString()
  fs.writeFileSync('./app/html/error.html', html)
}

fs.rmSync('./app/html', { recursive: true, force: true })
fs.mkdirSync('./app/html')

buildHtml('en') // async
// buildHtml('ro') // async
buildErrorHtml()
