class ClassServiceWorker {
	pushdata = []
	SW = null

	constructor() {
		this.init()
	}

	async init() {
		// Instalando o Service Worker
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', (e) => {
				console.log('SWMessage:', e.data)
				this.pushdata.push(e.data)
			})

			let sw = await navigator.serviceWorker.register(
				location.origin + '/sw.js',
				{ scope: './' },
			)
			this.SW = sw
			return this.SW
		} else {
			console.error('Service Worker unsupported!')
		}
	}
}

const SWorker = new ClassServiceWorker()
