/**
 *  HELPERS
 *  funções auxiliares soltas
 */

var ALERT = 'red',
	INFO = 'blu',
	WARN = 'ora',
	HELPER_COUNTER = null,
	TMP,
	TMP1,
	TMP2

function realToFloat(v) {
	if (v.trim() == '') v = '0'
	return parseFloat(v.replace(/\.| /g, '').replace(/,/g, '.'))
}
// Converte um Float para Real (sem R$)
function floatToReal(v) {
	return parseFloat(v).toLocaleString('pt-br', {minimumFractionDigits: 2})
}
// Converte um INTEIRO para a base 36 ou a DATA atual (timestamp)
function tokey(n) {
	return ('number' == typeof n ? n : new Date().getTime()).toString(36)
}

// Reverte da base 36 para INTEIRO
function unkey(t) {
	return 'string' == typeof t ? parseInt(t, 36) : false
}

function report(text, type, extra, tempo) {
	extra = extra || null
	tempo = tempo || 2000 + text.length * 40
	type = type || ALERT

	// Mostra no console, também.
	//LOG(text, type, extra)

	//Criando o toast, eu mesmo...
	var id = tokey()
	var toast = document.createElement('DIV')
	toast.className = 'xtoast ' + type
	toast.id = id
	//toast.innerHTML = '<i class="material-icons">close</i>' + text
	toast.innerHTML = '<i class="fa-solid fa-xmark"></i>' + text
	toast.onclick = function(e) {
		var x = e.target.nodeName == 'I' ? e.target.parentElement : e.target
		x.classList.remove('active')
		setTimeout(function() {
			x.remove()
		}, 400)
	}
	__('#ctoast').appendChild(toast)

	//console.log(tempo, text.length * 30, text.length, text)

	setTimeout(function() {
		document.getElementById(id).classList.add('active')
		setTimeout(function() {
			var e = document.getElementById(id)
			if (e) {
				e.classList.remove('active')
				setTimeout(function() {
					e.remove()
				}, 400)
			}
		}, tempo)
	}, 500)

	return true
}

// Log no console
function LOG(text, type, extra) {
	extra = extra || null
	type = type || ALERT
	var csl = 'log'
	if (type == ALERT) csl = 'error'
	if (type == WARN) csl = 'warn'

	return console[csl](text, extra)
}

// Gera um TOKEN aleatório
function rpass(chars) {
	if ('undefined' == typeof chars || chars > 40 || chars < 0) chars = 20
	var pass = '',
		ascii = [
			[48, 57],
			[64, 90],
			[97, 122]
		]
	for (var i = 0; i < chars; i++) {
		var b = Math.floor(Math.random() * ascii.length)
		pass += String.fromCharCode(Math.floor(Math.random() * (ascii[b][1] - ascii[b][0])) + ascii[b][0])
	}
	return pass
}

// GetElementById
const __ = (e, b) => (b ? b : document).querySelector(e) || false
const _a = (e, b) => (b ? b : document).querySelectorAll(e) || false

// Retorna uma mensagem gravada no arquivo /lang/xx_XX.js substituindo "$n" por um valor informado
function _m(o, m) {
	if ('undefined' == typeof LANG || !LANG[o][m]) return ''
	var t = LANG[o][m]
	for (var i = 2; i < arguments.length; i++) {
		t = t.replace(new RegExp('\\$' + (i - 1), 'g'), arguments[i])
	}
	if(undefined !== typeof SPEECH) SPEECH.falar(t)
	return t
}

// Mostra o GLASS e troca o texto, se indicado: glass(true, 'Aguarde ...')
const glass = (text, vitrine) => {
	__('#x_media_glassText').innerHTML = 'string' == typeof text ? text : ''
	__('#x_media_glassText').style.display = 'string' == typeof text ? 'block' : 'none'
	__('#x_media_glass').style.display = text === false ? 'none' : 'flex'
	__('#x_media_glass').classList[vitrine === true ? 'add' : 'remove']('vitrine')
}

// USar para sinalizar quando se clica no APP
function click() {
	SOUND.click.play()
	window.navigator.vibrate(30)
}

// Vibrar para chamar a atenção
function vibrar() {
	window.navigator.vibrate(30, 100, 30)
}

// Função para limpar tags HTML de uma string
// Ex.: quando alguém cola um texto externo em uma caixa de texto....
function clearText(txt) {
	var div = document.createElement('div')
	txt = txt.replace(/<div>.*?<\/div>/g, function(a) {
		return a.replace('<div>', '\n').replace('</div>', '')
	})
	div.innerHTML = txt
	return div.textContent || div.innerText || ''
}

// Substitue *, _ e - por <b>, <i> e <s>, respectivamente
function textToHtml(t) {
	return t
		.replace(/([^\w]|\s|_|\-)(\*([^/s]|.*?)\*)([^\w]|\s|_|\-)/g, '$1<b>$3</b>$4') // *bold*
		.replace(/([^\w]|\s|\*|\-)(\__([^/s]|.*?)\_)([^\w]|\s|\*|\-)/g, '$1<i>$3</i>$4') // _italic_
		.replace(/([^\w]|\s|\*|_)(\-([^/s]|.*?)\-)([^\w]|\s|\*|_)/g, '$1<s>$3</s>$4') // -tachado-
	//.replace(/\n(\*)(\s)(.*?)\n/g, '<li>$3</li>\n') // {\n} * Listagem (li) {\n}
}

// Barra de progresso
const progress = on => {
	var on = on || false
	__('#x_media_progress').style.display = on ? 'block' : 'none'
}

function formatdate(da) {
	try {
		m = new Date(da)
	} catch (e) {
		return false
	}
	var t = new Date().toLocaleDateString().split('/')
	var h = m.toLocaleDateString().split('/')
	return parseInt(t[2] + t[1] + t[0]) - parseInt(h[2] + h[1] + h[0]) == 0
		? m.toLocaleTimeString()
		: m.toLocaleDateString()
}

/**
 * Calcula o tempo indicado (String (exp)) com o tempo atual e retorna a diferença em dias ou horas(H:m:s)
 * @param  {String} exp Data de expiração
 * @return {String}     A diferença em dias ou horas
 *
 * Ex.: expiraIn("2019-11-04 23:59:59") --> para a data atual de "2019-10-31 21:51:12" == "4 dias"
 */
function expiresIn(exp, now) {
	// Is date "exp" ??
	if ('string' == typeof exp) {
		try {
			exp = new Date(exp)
		} catch (e) {
			return false
		}
	} else {
		return false
	}

	// Optional "now"
	if ('string' == typeof now) {
		try {
			now = new Date(now)
		} catch (e) {
			now = new Date()
		}
	} else {
		now = new Date()
	}

	// Calc
	var v = parseInt((exp.getTime() - now.getTime()) / 1000)
	if (!v || v < 0) return false

	// Dias
	var d = parseInt(v / 86400)
	//if(d > 0) return d + ' dia' + (d > 1 ? 's':'')

	// Horas
	var h = parseInt((v - d * 86400) / 3600)
	var m = parseInt((v - d * 86400 - h * 3600) / 60)
	var s = parseInt(v - d * 86400 - h * 3600 - m * 60)

	// Out
	//return (d == 0 ? '' : d + ' dia' + (d > 1 ? 's':'') + ' e ')
	return (d == 0 ? '' : d + 'd + ') + h + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s) // + 'hms'
}

function counterOn(start, tst, cb, final) {
	if ('function' != typeof cb) cb = function() {}
	if (start === false) return clearInterval(HELPER_COUNTER)

	//var display = document.getElementById(elm)
	//if(!display) return false

	HELPER_COUNTER = setInterval(function() {
		var t = expiresIn(tst)
		if (t === false) {
			clearInterval(HELPER_COUNTER)
			return cb(false)
		}
		cb(t)
		//display.innerHTML = t
	}, 1000)
}

// Somente números em INPUTs
// uso: <input type="number/text" onkeyup="numberOnly(this)"/>
function numberOnly(e) {
	setTimeout(function() {
		e.value = e.value.replace(/[^0-9]+/g, '')
		e.value = !parseInt(e.value) ? '' : parseInt(e.value)
	}, 100)
}

// Convert PT1H2M3S to Date string
function convTime(i) {
    var i = i.toUpperCase()
    var r = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
    var h = 0, m = 0, s = 0, t = 0, o = ''

    if (r.test(i)) {
        var matches = r.exec(i)
        if (matches[1]) h = Number(matches[1])
        if (matches[2]) m = Number(matches[2])
        if (matches[3]) s = Number(matches[3])
        t = h * 3600 + m * 60 + s
        o = (h < 1 ? '' : h + ':') + (h > 0 && m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
    }
    return [t, o]
}
