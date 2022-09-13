import fs from 'fs'
import minify from 'html-minifier'
import Template from '../../src/lib/Template.js'
import Language from '../../src/electron/lib/Language.js'
import packageJson from '../../package.json' assert { type: 'json' }
import Fetch from '../../src/electron/lib/Fetch.js'

function buildHtml (locale) {
  global.locale = locale

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

  // sort the fonts by category
  const fonts = JSON.parse(fs.readFileSync('./download/font.json').toString())
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

  // i18n words
  const words = {
    // general css values
    none: Language.localize('None'),
    inherit: Language.localize('Inherit'),
    initial: Language.localize('Initial'),
    revert: Language.localize('Revert'),
    unset: Language.localize('Unset'),

    // fills
    'linear-gradient': Language.localize('Linear gradient'),
    'radial-gradient': Language.localize('Radial gradient'),
    image: Language.localize('Image'),

    // effects
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
    'mix-blend-mode': Language.localize('Blend mode')
  }

  // about details
  const about = {
    version: packageJson.version,
    electron: packageJson.devDependencies.electron.substring(1)
  }

  // generate the html contents
  const html = Template.getHtmlTemplate('./src/html/index.html', {
    partialDir: './src/html/partial',
    vars: {
      pageTitle: 'Desech Studio',
      about,
      popularFonts,
      categoryFonts,
      words: JSON.stringify(words)
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
  const baseUrl = 'https://raw.githubusercontent.com/desech/desech-studio/master/download'
  const dir = font.family.replaceAll(' ', '+')
  return {
    family: font.family,
    url: baseUrl + `/font/${dir}.zip`
  }
}

function buildMainHtml () {
  const loading = fs.readFileSync('./src/html/loading.html').toString()
  fs.writeFileSync('./app/html/loading.html', loading)
  const error = fs.readFileSync('./src/html/error.html').toString()
  fs.writeFileSync('./app/html/error.html', error)
}

fs.rmSync('./app/html', { recursive: true, force: true })
fs.mkdirSync('./app/html')

buildHtml('en')
// buildHtml('ro')
buildMainHtml()
