import fs from 'fs'
import glob from 'glob'
import CleanCSS from 'clean-css'

function buildCss () {
  // delete the folder
  fs.rmSync('./app/css', { recursive: true, force: true })

  // read the css files
  const files = [
    './app/ui/css/general/reset.css',
    './app/ui/css/general/animation.css',
    ...glob.sync('./app/font/**/font.css'),
    ...glob.sync('./src/css/**/*.css')
  ]
  let css = ''
  for (const file of files) {
    const contents = fs.readFileSync(file).toString()
    // fix dir paths in font css
    css += contents.replace(/\.\.\/\.\.\//gm, '../')
  }

  // minify the css - https://github.com/jakubpawlowicz/clean-css
  const minCss = new CleanCSS().minify(css).styles

  // create the css folder and file
  fs.mkdirSync('./app/css')
  fs.writeFileSync('./app/css/style.css', minCss)
}

buildCss()

// commands for formatting the animation.css file
// perl -pi -e 's/-webkit-.+?;//gi' animation3.css
// minify first - https://www.uglifycss.com/
// perl -pi -e 's/@-webkit-.+?}}//gi' animation3.css
// prettify - https://www.prettifycss.com/
