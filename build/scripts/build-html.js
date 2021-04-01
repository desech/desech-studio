import fs from 'fs'
import fetch from 'node-fetch'
import minify from 'html-minifier'
import Template from '../../src/lib/Template.js'
import Language from '../../src/electron/lib/Language.js'
import pjson from '../../package.json'

async function buildHtml (locale) {
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
      category: Language.localize('Serif', locale),
      fonts: []
    },
    {
      category: Language.localize('Sans Serif', locale),
      fonts: []
    },
    {
      category: Language.localize('Display', locale),
      fonts: []
    },
    {
      category: Language.localize('Handwriting', locale),
      fonts: []
    },
    {
      category: Language.localize('Monospace', locale),
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
    filter: Language.localize('Filter', locale),
    transform: Language.localize('Transform', locale),
    'drop-shadow': Language.localize('Drop shadow', locale),
    opacity: Language.localize('Opacity', locale),
    blur: Language.localize('Blur', locale),
    brightness: Language.localize('Brightness', locale),
    contrast: Language.localize('Contrast', locale),
    'hue-rotate': Language.localize('Hue', locale),
    saturate: Language.localize('Saturation', locale),
    grayscale: Language.localize('Grayscale', locale),
    sepia: Language.localize('Sepia', locale),
    invert: Language.localize('Invert', locale),
    shadow: Language.localize('Box shadow', locale),
    perspective: Language.localize('Perspective', locale),
    translate3d: Language.localize('Move', locale),
    scale3d: Language.localize('Scale', locale),
    rotate: Language.localize('Rotate', locale),
    skew: Language.localize('Skew', locale),
    matrix: Language.localize('Matrix', locale),
    matrix3d: Language.localize('Matrix 3D', locale),
    transition: Language.localize('Transition', locale),
    blend: Language.localize('Blend mode', locale)
  }

  // about details
  const about = {
    version: pjson.version,
    electron: pjson.devDependencies.electron.substring(1)
  }

  // generate the html contents
  const html = Template.getHtmlTemplate('./src/html/index.html', {
    locale,
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

fs.rmSync('./app/html', { recursive: true, force: true })
fs.mkdirSync('./app/html')

buildHtml('en') // async
// buildHtml('ro') // async
