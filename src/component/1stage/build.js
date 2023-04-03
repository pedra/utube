const path = require('path')

let html = [], 
    css = [], 
    js = []
    
html.push(path.resolve(__dirname, 'stage.html'))
css.push(path.resolve(__dirname, 'stage.css'))
js.push(path.resolve(__dirname, 'stage.js'))

export { html, css, js }