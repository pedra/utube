const path = require('path')

let html = [], 
    css = [], 
    js = []
    
html.push(path.resolve(__dirname, 'login.html'))
css.push(path.resolve(__dirname, 'login.css'))
js.push(path.resolve(__dirname, 'login_view.js'))
js.push(path.resolve(__dirname, 'login.js'))

export { html, css, js }