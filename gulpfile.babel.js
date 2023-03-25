/*
	By Bill Rocha <prbr@ymail.com>

	*** Este script requer o Babel & Gulp 4 ou posterior ***
	Antes de usar, instale a última versão do GULP-CLI e os plugins necessários:

	npm i --save-dev @babel/cli @babel/core @babel/polyfill @babel/preset-env @babel/register
	npm i --save-dev gulp@4 gulp-autoprefixer gulp-clean-css gulp-concat gulp-html-minifier2 gulp-if gulp-watch gulp-babel
	npm i --save-dev gulp-javascript-obfuscator gulp-sass gulp-uglify streamqueue uglify-es del yargs

	adicione essas linhas no seu package.js

	"babel": {
		"presets": [ "@babel/preset-env"]
	},

 */

'use strict'

//import { exec, spawn } from 'child_process'
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
// import uglifyes from 'uglify-es'
// import composer from 'gulp-uglify/composer'
import uglify from 'gulp-uglify'
//import path from 'path'
//import del from 'del'
import imagemin from 'gulp-imagemin'

//const uglify = composer(uglifyes, console)
const argv = yargs.argv

// args
let PRO = argv.p !== undefined // gulp -p (production mode)
let OBF = (argv.o || false) && PRO // gulp -o (obfuscator)
let BABEL = argv.b !== undefined // gulp -b (to run Babel)

// show config
console.log(
	'\n---------------------------------------------------\n    ' +
	(!PRO
		? "DEVELOPMENT mode ['gulp -p' to production]"
		: 'PRODUCTION mode') +
	'\n---------------------------------------------------\n',
)

// IMAGE  ------------------------------------------------------------------------------------------
const image = () =>
	src(['src/media/**/*'])
		.pipe(imagemin({ verbose: false }))
		.pipe(dest('public/media'))

// HTML  ------------------------------------------------------------------------------------------
const html_compress = (files, output, destination = false) =>
	src(files)
		.pipe(concat(output))
		.pipe(
			gulpif(
				PRO,
				htmlmin({
					collapseWhitespace: true,
					removeComments: true,
					removeEmptyAttributes: true,
				}),
			),
		)
		.pipe(dest(destination ? destination : 'public'))

const html = () => {
	return html_compress(
		[
			//`src/page/template/html/inc/header.html`, //${PRO ? '' : '_dev'}.html`, // carrega os css - quando cirar um novo adicionar nesse arquivo
			//'src/page/template/html/header.html',
			'src/html/index.html',
			//'src/page/template/html/footer.html',
			//`src/page/template/html/inc/footer.html`, //${PRO ? '' : '_dev'}.html` // carrega os js - quando cirar um novo adicionar nesse arquivo
		],
		'index.html',
		'public',
	)
}

// STYLE ------------------------------------------------------------------------------------------

const css = () =>
	streamqueue(
		{ objectMode: true },
		//src(['public/src/sass/**/*.scss']).pipe(sass()),
		src([
			'src/css/font.css',
			'src/css/vars.css',
			//'src/css/reset.css',
			'src/css/shop.css',
			'src/css/stage.css',
			'src/css/player.css',

			// Lib
			'node_modules/cropperjs/dist/cropper.min.css',

			// Default theme ...
			'src/css/theme/dark.css',

			// Template (global style)
			'src/css/style.css',
		]),
	)
		.pipe(concat('style.css'))
		.pipe(gulpif(PRO, minifyCSS({ level: { 1: { specialComments: 0 } } })))
		.pipe(dest('public'))

/*

	// JS VENDOR ------------------------------------------------------------------------------------------
	const vendor = () =>
		src([
			'public/js/src/vendor/source/jsbn.js',
			'public/js/src/vendor/source/pbkdf2.js',
			'public/js/src/vendor/source/rsa.js',
			'public/js/src/vendor/source/aes.js',
			'public/js/src/vendor/source/aesman.js',
			'public/js/src/vendor/google.js'
		])
			.pipe(gulpif(BABEL, babel()))
			.pipe(concat('v.js'))
			.pipe(gulpif(PRO, uglify()))
			.pipe(gulpif(OBF, javascriptObfuscator({compact: true, sourceMap: false})))
			.pipe(dest('public/js'))

	const vendor_aes = () =>
		src([
			'public/js/src/vendor/source/aes.js',
			'public/js/src/vendor/source/pbkdf2.js',
			'public/js/src/vendor/source/aesman.js'
		])
			.pipe(concat('va.js'))
			.pipe(gulpif(PRO, uglify()))
			.pipe(dest('public/js'))

	const vendor_rsa = () =>
		src(['public/js/src/vendor/source/jsbn.js', 'public/js/src/vendor/source/rsa.js'])
			.pipe(concat('vr.js'))
			.pipe(gulpif(PRO, uglify()))
			.pipe(dest('public/js'))
*/
// JS LIB ------------------------------------------------------------------------------------------
const prelib = (cb) =>
	src([
		//'src/lib/helper.js',
		'src/lib/utils.js',
		'src/lib/connector.js',
	])
		.pipe(gulpif(BABEL, babel()))
		.pipe(concat('lib_temp.js'))
		.pipe(gulpif(PRO, uglify()))
		.pipe(
			gulpif(
				OBF,
				javascriptObfuscator({ compact: true, sourceMap: false }),
			),
		)
		.pipe(dest('src/temp/lib'))

const lib_modules = () =>
	src([
		'node_modules/socket.io/client-dist/socket.io.min.js',
		'node_modules/cropperjs/dist/cropper.min.js',
	])
		.pipe(concat('modules.js'))
		.pipe(dest('src/temp/lib'))

const lib = (cb) =>
	src(['src/temp/lib/modules.js', 'src/temp/lib/lib_temp.js'])
		.pipe(concat('lib.js'))
		.pipe(dest('public'))

// App
const js = () =>
	src([
		'src/config.js',
		'src/worker/sworker.js',
		'src/js/view.js',
		'src/js/page.js',
		'src/js/player.js',
		'src/js/app.js',
	])
		.pipe(gulpif(BABEL, babel()))
		.pipe(gulpif(PRO, uglify()))
		.pipe(concat('script.js'))
		.pipe(
			gulpif(
				OBF,
				javascriptObfuscator({ compact: true, sourceMap: false }),
			),
		)
		.pipe(dest('public'))

// SERVICE WORKER  ------------------------------------------------------------------------------------------
const sw = () => {
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
		.pipe(
			gulpif(
				OBF,
				javascriptObfuscator({ compact: true, sourceMap: false }),
			),
		)
		.pipe(dest('public'))
}

// Default ------
exports.default = parallel(html, css, sw, js)

// CSS ------
exports.css = css

// Html ------
exports.html = html

// JS ------
exports.js = js

// libraries ------
exports.lib = series(parallel(prelib, lib_modules), lib)
// exports.lib_modules = lib_modules

// Vendors ------
// exports.vendor = vendor
// exports.vendor_aes = vendor_aes
// exports.vendor_rsa = vendor_rsa
// exports.vendorall = parallel(vendor, vendor_aes, vendor_rsa)

exports.image = image
exports.sw = sw