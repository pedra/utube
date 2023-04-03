const path = require('path')

let html = [], 
    css = [], 
    js = []
    
html.push(path.resolve(__dirname, 'shop.html'))
css.push(path.resolve(__dirname, 'shop.css'))
js.push(path.resolve(__dirname, 'shop.js'))

export { html, css, js }