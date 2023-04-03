'use strict'
/*
	By Bill Rocha <prbr@ymail.com>

	*** Este script requer o Babel & Gulp 4 ou posterior ***
	Antes de usar, instale a última versão do GULP-CLI e os plugins necessários.
	Para instalar o GULP-CLI, execute o comando:

	npm install -g gulp-cli

	Para rodar o script, execute o comando:

	gulp -p (production mode) -b (to run Babel) -o (obfuscator) 
	gulp -pbo (production mode, Babel, obfuscator)

	Adicione essas linhas no seu package.js:

	"babel": {
		"presets": [ "@babel/preset-env"]
	},

*/


import fs from 'node:fs/promises'
// import del from 'del'
import { exec, spawn } from 'child_process'
import { gulp, series, parallel, src, dest } from 'gulp'
import babel from 'gulp-babel'
import gulpif from 'gulp-if'
import minifyCSS from 'gulp-clean-css'
import htmlmin from 'gulp-html-minifier2'
import concat from 'gulp-concat'
import header from 'gulp-header'
import yargs from 'yargs'
import streamqueue from 'streamqueue'
import javascriptObfuscator from 'gulp-javascript-obfuscator'
import uglify from 'gulp-uglify'
import path from 'path'
import imagemin from 'gulp-imagemin'

const public_dir = path.resolve(__dirname, 'public')
const argv = yargs.argv

// args
const PRO = argv.p !== undefined // gulp -p (production mode)
const OBF = (argv.o || false) && PRO // gulp -o (obfuscator)
const BABEL = argv.b !== undefined // gulp -b (to run Babel)

// show config
console.log(
	'\n---------------------------------------------------\n    ' +
	(!PRO
		? "DEVELOPMENT mode ['gulp -p' to production]"
		: 'PRODUCTION mode') +
	'\n---------------------------------------------------\n',
)

// IMAGE  ------------------------------------------------------------------------------------------
function image() {
	return src(IMG)
		.pipe(imagemin({ verbose: false }))
		.pipe(dest(public_dir + '/media'))
}

// HTML  ------------------------------------------------------------------------------------------
function htmlCompress(files = [], output, destination = false) {
	return src(files)
		.pipe(concat(output))
		.pipe(gulpif(PRO, htmlmin({
			collapseWhitespace: true,
			removeComments: true,
			removeEmptyAttributes: true,
		})))
		.pipe(dest(destination ? destination : public_dir))
}

function html() {
	let h = [...HTML_init, ...HTML, ...HTML_final]
	return htmlCompress(h, 'index.html')
}

// STYLE ------------------------------------------------------------------------------------------
function css() {
	let c = [...CSS_init, ...CSS, ...CSS_final]
	return streamqueue(
		{ objectMode: true },
		//src(['public/src/sass/**/*.scss']).pipe(sass()),
		src(c),
	)
		.pipe(concat('style.css'))
		.pipe(gulpif(PRO, minifyCSS({ level: { 1: { specialComments: 0 } } })))
		.pipe(dest(public_dir))
}

// JS LIB ------------------------------------------------------------------------------------------
function prelib() {
	return src([
		'src/lib/utils.js',
		'src/lib/connector.js',
	])
		.pipe(gulpif(BABEL, babel()))
		.pipe(concat('lib_temp.js'))
		.pipe(gulpif(PRO, uglify()))
		.pipe(gulpif(OBF, javascriptObfuscator({ compact: true, sourceMap: false })))
		.pipe(dest('src/temp/lib'))
}

function lib_modules() {
	return src([
		'src/sync/aes_main.js',
		'src/sync/jsbn.js',
		'src/sync/rsa.js',
		'node_modules/socket.io/client-dist/socket.io.min.js',
		'node_modules/cropperjs/dist/cropper.min.js',
		'node_modules/crypto-js/crypto-js.js'
	])
		.pipe(concat('modules.js'))
		.pipe(gulpif(PRO, uglify()))
		.pipe(dest('src/temp/lib'))
}

function lib() {
	return src(['src/temp/lib/modules.js', 'src/temp/lib/lib_temp.js'])
		.pipe(concat('lib.js'))
		.pipe(dest(public_dir))
}

// App
function js() {
	let j = [...JS_init, ...JS, ...JS_final]
	return src(j)
		.pipe(gulpif(BABEL, babel()))
		.pipe(gulpif(PRO, uglify()))
		.pipe(concat('script.js'))
		.pipe(gulpif(OBF, javascriptObfuscator({ compact: true, sourceMap: false })))
		.pipe(dest(public_dir))
}

// SERVICE WORKER  ------------------------------------------------------------------------------------------
function sw() {
	let VERSION =
		'const VERSION="' + new Date().getTime() + (PRO ? '' : '_dev') + '";\r'

	let source = PRO
		? ['src/worker/file.js', 'src/worker/sw.js']
		: ['src/worker/file_dev.js', 'src/worker/sw.js']

	return src(source)
		.pipe(gulpif(BABEL, babel()))
		.pipe(concat('sw.js'))
		.pipe(header(VERSION))
		.pipe(gulpif(PRO, uglify()))
		.pipe(gulpif(OBF, javascriptObfuscator({ compact: true, sourceMap: false })))
		.pipe(dest(public_dir))
}

function upload(c) {
	let destination = 'lunazu:/var/www/' + (PRO ? 'wee2.trade/' : 'freedomee.org/front/')

	exec(`scp ./public/*.js ./public/*.css ./public/*.html ${destination}`, (error, stdout, stderr) => {
		if (error) console.log(`exec error: ${error}`)
		if (stdout) console.log(`stdout: ${stdout}`)
		if (stderr) console.log(`stderr: ${stderr}`)
	})

	return c()
}

/*
	Carregar os arquivos de build.js e adicionar a lista de arquivos em um array.

	const HTML = []
	const CSS = []
	const JS = []
	const IMG = []

	O processamento se dará na sequencia:

	export.default = series(add, parallel(html, css, js, img), upload)
	export.html = series(add, html)
	export.css = series(add, css)
	export.js = series(add, js)
	export.img = series(add, img)

	Os tasks serão executados em sequencia, usando esses arrays globais como parâmetros.

*/
function add(c) {

	const scan = async (d, f) => {
		if (!f) f = []
		let l = await fs.readdir(d)
		for (let k in l) {
			let stat = await fs.stat(d + '/' + l[k])
			if (stat.isDirectory()) await scan(d + '/' + l[k], f)
			else if (l[k] == 'build.js') {
				let x = require(`${d}/${l[k]}`)
				if (x.html) HTML = HTML.concat(x.html)
				if (x.css) CSS = CSS.concat(x.css)
				if (x.js) JS = JS.concat(x.js)
				if (x.img) IMG = IMG.concat(x.img)
			}
		}
		return f
	}

	scan('./src').then(f => {
		// console.log(
		// 	'HTML: ', [HTML_init, HTML, HTML_final],
		// 	'CSS: ', [CSS_init, CSS, CSS_final],
		// 	'JS: ', [JS_init, JS, JS_final],
		// 	'IMG: ', IMG
		// )
		return c()
	})
}


// HTML --------------------------------------- config
let HTML_init = [
	'src/html/inc/head.html',
	'src/html/header.html'
],
	HTML = [],
	HTML_final = [
		'src/html/inc/footer.html'
	]

// CSS  --------------------------------------- config
let CSS_init = [
	'src/css/font.css',
	'src/css/vars.css',
	'src/css/utils.css',
	//'src/css/shop.css',
	//'src/css/stage.css',
	'src/css/login.css',
	'src/css/player.css',

	// Lib
	'node_modules/cropperjs/dist/cropper.min.css'
],
	CSS = [],
	CSS_final = [
		// Default theme ...
		'src/css/theme/dark.css',

		// Template (global style)
		'src/css/style.css',
	]

// JS   --------------------------------------- config
let JS_init = [
	'src/config.js',
	'src/worker/sworker.js'
],
	JS = [
		'src/js/view.js',
		'src/js/page.js',
		'src/js/player.js',
		'src/js/login_view.js',
		'src/js/login.js'
	],
	JS_final = [
		'src/js/app.js',
	]

// IMG  --------------------------------------- config
let IMG = ['src/media/**/*']

exports.add = add

// Default ------
exports.default = series(add, parallel(html, css, sw, js), upload)

// CSS ------
exports.css = series(add, css)

// Html ------
exports.html = series(add, html)

// JS ------
exports.js = series(add, js)

// libraries ------
exports.lib = series(parallel(prelib, lib_modules), lib)

// Others ------
exports.image = series(add, image)
exports.sw = sw

// Deploy to server...
exports.upload = upload