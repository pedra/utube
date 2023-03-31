

exports default = (assets) => {
    assets.html.push(path.resolve(__dirname, '/stage.html'))
    assets.css.push(path.resolve(__dirname, '/stage.css'))
    assets.js.push(path.resolve(__dirname, '/stage.js'))

    return assets
}