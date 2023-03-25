class ClassConfig {
	http = 'https://'
	domain = 'freedomee.org'
	base_url = this.http + this.domain
	api_url = this.http + 'a.' + this.domain
	static_url = this.base_url //`${this.http}s.${this.domain}`
	mobile_url = this.base_url //`${this.http}m.${this.domain}`
	media_url = this.static_url + '/media'
	lang_url = this.static_url + '/lang'
	lang_flag_url = this.media_url + '/flag'

	lang_absent = '***'
	lang = ''
	langs = ['pt', 'en', 'es']
	lang_data = []
	lang_html_id = '#tmn-lang'

	access_count = 0
	countdown = 1
	countdownfactor = 10

	constructor() {
		this.load().then((r) => {
			this.access_count++
			this.countdown++
			if (this.countdown > this.countdownfactor) this.countdown = 1
			this.save('access')

			if (this.lang == '') {
				this.lang = this.langs[1]
				this.langs.map((a) =>
					navigator.languages.includes(a) ? (this.lang = a) : null
				)
			}
			this.loadLang(this.lang, true)
		})
	}

	// LANG
	async loadLang(lang, force = false) {
		if (
			force !== false ||
			(lang &&
				lang != this.lang &&
				this.langs.includes(lang.toLowerCase()))
		) {
			try {
				let l = await fetch(`${this.lang_url}/${lang}.json`)
				this.lang_data = await l.json()
				this.lang = lang
				return await this.save('lang')
			} catch (e) {
				return false
			}
		}
	}

	get(id = '1', vars = []) {
		const t = this.lang_data.find((a) => (a.id == id ? a : false))
		if (!t) return this.lang_absent

		return {
			text: this.parseStringVar(t.text, vars),
			plural: this.parseStringVar(t.plural, vars),
		}
	}

	parseStringVar(text, vars = []) {
		var f = text.matchAll(/\${[\w.\[\]]+}/gim)
		var t = ''
		for (var i of f) {
			var s =
				vars[i[0].replace(/\${/g, '').replace('}', '')] ??
				this.lang_absent
			t = text.replace(i[0], s)
		}
		return t
	}

	async translate(lang = false) {
		await this.loadLang(lang || this.lang)
		this.setLangDisplay()

		_a('[data-lang]').forEach((a) => {
			var id = a.getAttribute('data-lang')

			const r = this.lang_data.find((a) => (a.id == id ? a : false))
			const n = ['INPUT']

			if (r) {
				if (r.text)
					a[n.includes(a.nodeName) ? 'value' : 'innerHTML'] = r.text

				if (r.att) {
					for (var i in r.att) {
						a.setAttribute(i, r.att[i])
					}
				}
			}
		})
	}

	setLangDisplay() {
		// eslint-disable-next-line prettier/prettier
		__(`${this.lang_html_id} img`).src = `${this.lang_flag_url}/${this.lang}.png`
		_a(`${this.lang_html_id} li`).forEach((a) => a.classList.remove('on'))
		// eslint-disable-next-line prettier/prettier
		__(`${this.lang_html_id} li.tmn-lang-${this.lang}`).classList.add('on')
	}

	async save(type = false) {
		let c = {}
		try {
			if (!type || type == 'lang') {
				c.lang = this.lang
				c.lang_data = this.lang_data
				await localStorage.setItem('lang', JSON.stringify(c))
			}

			if (!type || type == 'access') {
				c.access_count = this.access_count
				c.countdown = this.countdown
				c.countdownfactor = this.countdownfactor
				await localStorage.setItem('access', JSON.stringify(c))
			}
			return true
		} catch (e) {
			return false
		}
	}

	async load() {
		try {
			const a = await JSON.parse(localStorage.getItem('access'))
			const l = await JSON.parse(localStorage.getItem('lang'))
			const c = Object.assign(a, l)

			for (var i in c) {
				if (i && this.hasOwnProperty(i)) this[i] = c[i]
			}
			return true
		} catch (e) {
			return false
		}
	}
}

const Config = null // = new ClassConfig()
