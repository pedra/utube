class ClassConnector {
	constructor() { }

	// Simple get
	async get(source, data = null, resp = 'json') {
		let url = `${API_URL}/${source}${
			data !== null && 
			'object' == typeof data ? '?' + new URLSearchParams(data) : ''}`
		const r = await fetch(url, {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				Accept: `application/${resp == 'json' ? 'json' : 'text'}`,
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer'
		})

		return r[resp == 'json' ? 'json' : 'text']()
	}

	// Simple post
	async post(source, data = [], send = 'json', resp = 'json') {
		let url = API_URL + '/' + source

		if (send == 'json') {
			data = JSON.stringify(data)
		}

		try {
			const r = await fetch(url, {
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				mode: 'cors', // no-cors, *cors, same-origin
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials: 'same-origin', // include, *same-origin, omit
				headers: {
					Accept: `application/${resp == 'json' ? 'json' : 'text'}`,
					'Content-Type': `application/${send == 'json' ? 'json' : 'x-www-form-urlencoded; charset=UTF-8'}`
				},
				redirect: 'follow', // manual, *follow, error
				referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
				body: data // body data type must match "Content-Type" header
			})
			return r[resp == 'json' ? 'json' : 'text']()
		} catch (e) {
			console.log(e)
			return false
		}
	}


	// Connector com criptografia do GateWay :: TODO!
	async way(source, data = [], type = 'json') {
		let url = API_URL + '/' + source

		const r = await fetch(url, {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers: {
				Accept: 'application/json',
				'Content-Type': `application/${type == 'json' ? 'json' : 'x-www-form-urlencoded; charset=UTF-8'
					}`
			},
			redirect: 'follow', // manual, *follow, error
			referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify(data) // body data type must match "Content-Type" header
		})
		return r.json()
	}

	// Connector socket :: TODO!
	async socket(source, data = [], type = 'json') {

	}

	async gate (controller = 'Gate', action = '', param = {}) {
		let d = {
			controller,
			action,
			param,

			id: APP.id,
			version: APP.version,
			key: APP.key,
			token: APP.token,
			geo: APP.geo
		}

		var enc = encrypt(JSON.stringify(d), APP.key)
		enc = APP.token + enc

		var r = await this.post(API_URL_GATE, enc, 'text', 'text')
		if('string' == typeof r) {
			try {
				var res = JSON.parse(decrypt(r, APP.key))
				if(res.key) APP.key = res.key
				if(res.token) APP.token = res.token
				return res
			} catch (e) {
				console.error('ERROR::', e)
				return false
			}
		}
		return false
	}
}

const Conn = new ClassConnector()
