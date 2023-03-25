/**
 *  HELPERS
 *  funções auxiliares
 */

const ALERT = 'red',
	INFO = 'blu',
	WARN = 'ora'
let HELPER_COUNTER = null

class Helper {
	realToFloat(v) {
		if (v.trim() == '') v = '0'
		return parseFloat(v.replace(/\.| /g, '').replace(/,/g, '.'))
	}
	// Converte um Float para Real (sem R$)
	floatToReal(v) {
		return parseFloat(v).toLocaleString('pt-br', {
			minimumFractionDigits: 2,
		})
	}
	// Converte um INTEIRO para a base 36 ou a DATA atual (timestamp)
	tokey(n) {
		return ('number' == typeof n ? n : new Date().getTime()).toString(36)
	}

	// Reverte da base 36 para INTEIRO
	unkey(t) {
		return 'string' == typeof t ? parseInt(t, 36) : false
	}

	report(text, type, extra, tempo) {
		extra = extra || null
		tempo = tempo || 2000 + text.length * 40
		type = type || ALERT

		// Mostra no console, também.
		//LOG(text, type, extra)

		//Criando o toast, eu mesmo...
		var id = this.tokey()
		var toast = document.createElement('DIV')
		toast.className = 'xtoast ' + type
		toast.id = id
		//toast.innerHTML = '<i class="material-icons">close</i>' + text
		toast.innerHTML = '<i class="fa-solid fa-xmark"></i>' + text
		toast.onclick = (e) => {
			var x = e.target.nodeName == 'I' ? e.target.parentElement : e.target
			x.classList.remove('active')
			setTimeout(() => {
				x.remove()
			}, 400)
		}
		__('#ctoast').appendChild(toast)

		//console.log(tempo, text.length * 30, text.length, text)

		setTimeout(() => {
			document.getElementById(id).classList.add('active')
			setTimeout(() => {
				var e = document.getElementById(id)
				if (e) {
					e.classList.remove('active')
					setTimeout(() => {
						e.remove()
					}, 400)
				}
			}, tempo)
		}, 500)

		return true
	}

	// Log no console
	LOG(text, type, extra) {
		extra = extra || null
		type = type || ALERT
		var csl = 'log'
		if (type == ALERT) csl = 'error'
		if (type == WARN) csl = 'warn'

		return console[csl](text, extra)
	}

	// Gera um TOKEN aleatório
	rpass(chars) {
		if ('undefined' == typeof chars || chars > 40 || chars < 0) chars = 20
		var pass = '',
			ascii = [
				[48, 57],
				[64, 90],
				[97, 122],
			]
		for (var i = 0; i < chars; i++) {
			var b = Math.floor(Math.random() * ascii.length)
			pass += String.fromCharCode(
				Math.floor(Math.random() * (ascii[b][1] - ascii[b][0])) +
					ascii[b][0],
			)
		}
		return pass
	}

	// GetElementById
	__(e, b) {
		return (b ? b : document).querySelector(e) || false
	}
	_a(e, b) {
		return (b ? b : document).querySelectorAll(e) || false
	}

	// Retorna uma mensagem gravada no arquivo /lang/xx_XX.js substituindo "$n" por um valor informado
	_m(o, m) {
		if ('undefined' == typeof LANG || !LANG[o][m]) return ''
		var t = LANG[o][m]
		for (var i = 2; i < arguments.length; i++) {
			t = t.replace(new RegExp('\\$' + (i - 1), 'g'), arguments[i])
		}
		if (undefined !== typeof SPEECH) SPEECH.falar(t)
		return t
	}

	// Mostra o GLASS e troca o texto, se indicado: glass(true, 'Aguarde ...')
	glass(text, vitrine) {
		__('#x_media_glassText').innerHTML = 'string' == typeof text ? text : ''
		__('#x_media_glassText').style.display =
			'string' == typeof text ? 'block' : 'none'
		__('#x_media_glass').style.display = text === false ? 'none' : 'flex'
		__('#x_media_glass').classList[vitrine === true ? 'add' : 'remove'](
			'vitrine',
		)
	}

	// USar para sinalizar quando se clica no APP
	click() {
		SOUND.click.play()
		window.navigator.vibrate(30)
	}

	// Vibrar para chamar a atenção
	vibrar() {
		window.navigator.vibrate(30, 100, 30)
	}

	// Função para limpar tags HTML de uma string
	// Ex.: quando alguém cola um texto externo em uma caixa de texto....
	clearText(txt) {
		var div = document.createElement('div')
		txt = txt.replace(/<div>.*?<\/div>/g, (a) => {
			return a.replace('<div>', '\n').replace('</div>', '')
		})
		div.innerHTML = txt
		return div.textContent || div.innerText || ''
	}

	// Substitue *, _ e - por <b>, <i> e <s>, respectivamente
	textToHtml(t) {
		return t
			.replace(
				/([^\w]|\s|_|\-)(\*([^/s]|.*?)\*)([^\w]|\s|_|\-)/g,
				'$1<b>$3</b>$4',
			) // *bold*
			.replace(
				/([^\w]|\s|\*|\-)(\__([^/s]|.*?)\_)([^\w]|\s|\*|\-)/g,
				'$1<i>$3</i>$4',
			) // _italic_
			.replace(
				/([^\w]|\s|\*|_)(\-([^/s]|.*?)\-)([^\w]|\s|\*|_)/g,
				'$1<s>$3</s>$4',
			) // -tachado-
		//.replace(/\n(\*)(\s)(.*?)\n/g, '<li>$3</li>\n') // {\n} * Listagem (li) {\n}
	}

	// Barra de progresso
	progress(on) {
		var on = on || false
		__('#x_media_progress').style.display = on ? 'block' : 'none'
	}

	formatdate(da) {
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
	expiresIn(exp, now) {
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
		return (
			(d == 0 ? '' : d + 'd + ') +
			h +
			':' +
			(m < 10 ? '0' + m : m) +
			':' +
			(s < 10 ? '0' + s : s)
		) // + 'hms'
	}

	counterOn(start, tst, cb, final) {
		if ('' != typeof cb) cb = () => {}
		if (start === false) return clearInterval(HELPER_COUNTER)

		//var display = document.getElementById(elm)
		//if(!display) return false

		HELPER_COUNTER = setInterval(() => {
			var t = this.expiresIn(tst)
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
	numberOnly(e) {
		setTimeout(() => {
			e.value = e.value.replace(/[^0-9]+/g, '')
			e.value = !parseInt(e.value) ? '' : parseInt(e.value)
		}, 100)
	}

	// CONVERT PT1H17M8S TO SECONDS - YOUTUBE
	cv(input) {
		var r = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/,
			h = 0,
			m = 0,
			s = 0,
			t = 0

		if (r.test(input)) {
			var matches = r.exec(input)
			if (matches[1]) h = Number(matches[1])
			if (matches[2]) m = Number(matches[2])
			if (matches[3]) s = Number(matches[3])
			t = h * 3600 + m * 60 + s
		}

		h = h < 1 ? '' : (h < 10 ? '0' + h : h) + ':'
		m = m < 1 ? '00' : m < 10 ? '0' + m : m
		s = s < 1 ? '00' : s < 10 ? '0' + s : s
		return { t, duration: h + m + ':' + s }
	}
}

export default new Helper()
