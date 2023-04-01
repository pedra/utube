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

'use strict'

// import del from 'del'
// import uglifyes from 'uglify-es'
// import composer from 'gulp-uglify/composer'
// uglify = composer(uglifyes, console)

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

class BuilderClass {

	constructor() {
		// show config
		console.log(
			'\n---------------------------------------------------\n    ' +
			(!PRO
				? "DEVELOPMENT mode ['gulp -p' to production]"
				: 'PRODUCTION mode') +
			'\n---------------------------------------------------\n',
		)
	}

	// IMAGE  ------------------------------------------------------------------------------------------
	image() {
		return src(['src/media/**/*'])
			.pipe(imagemin({ verbose: false }))
			.pipe(dest(public_dir + '/media'))
	}

	// HTML  ------------------------------------------------------------------------------------------
	htmlCompress(files, output, destination = false) {
		return src(files)
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
			.pipe(dest(destination ? destination : public_dir))
	}

	html() {
		return Builder.htmlCompress('src/html/index.html', 'index.html')
		// return 
		// this.htmlCompress(
		// 	[
		// 		//`src/page/template/html/inc/header.html`, //${PRO ? '' : '_dev'}.html`, // carrega os css - quando cirar um novo adicionar nesse arquivo
		// 		//'src/page/template/html/header.html',
		// 		'src/html/index.html',
		// 		//'src/page/template/html/footer.html',
		// 		//`src/page/template/html/inc/footer.html`, //${PRO ? '' : '_dev'}.html` // carrega os js - quando cirar um novo adicionar nesse arquivo
		// 	]

	}

	// STYLE ------------------------------------------------------------------------------------------

	css() {
		return streamqueue(
			{ objectMode: true },
			//src(['public/src/sass/**/*.scss']).pipe(sass()),
			src([
				'src/css/font.css',
				'src/css/vars.css',
				'src/css/utils.css',
				'src/css/shop.css',
				'src/css/stage.css',
				'src/css/login.css',
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
			.pipe(dest(public_dir))
	}

	// JS LIB ------------------------------------------------------------------------------------------
	prelib() {
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

	lib_modules() {
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

	lib() {
		return src(['src/temp/lib/modules.js', 'src/temp/lib/lib_temp.js'])
			.pipe(concat('lib.js'))
			.pipe(dest(public_dir))
	}

	// App
	js() {
		return src([
			'src/config.js',
			'src/worker/sworker.js',
			'src/js/view.js',
			'src/js/page.js',
			'src/js/player.js',
			'src/js/login_view.js',
			'src/js/login.js',
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
			.pipe(dest(public_dir))
	}

	// SERVICE WORKER  ------------------------------------------------------------------------------------------
	sw() {
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
			.pipe(dest(public_dir))
	}

	upload(c) {
		let destination = 'lunazu:/var/www/' + (PRO ? 'wee2.trade/' : 'freedomee.org/front/')

		exec(`scp ./public/*.js ./public/*.css ./public/*.html ${destination}`, (error, stdout, stderr) => {
			if (error) console.log(`exec error: ${error}`)
			if (stdout) console.log(`stdout: ${stdout}`)
			if (stderr) console.log(`stderr: ${stderr}`)
		})

		return c()
	}

	test(c) {
		console.log('Teste')
		return c()
	}
}

const Builder = new BuilderClass

exports.test = Builder.test

// Default ------
exports.default = series(parallel(
	Builder.html,
	Builder.css,
	Builder.sw,
	Builder.js),
	Builder.upload)

// CSS ------
exports.css = Builder.css

// Html ------
exports.html = Builder.html

// JS ------
exports.js = Builder.js

// libraries ------
exports.lib = series(parallel(Builder.prelib, Builder.lib_modules), Builder.lib)

// Others ------
exports.image = Builder.image
exports.sw = Builder.sw

// Deploy to server...
exports.upload = Builder.upload