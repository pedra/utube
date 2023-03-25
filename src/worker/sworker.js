class ClassServiceWorker {
	pushdata = []
	SW = null

	constructor() {}

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

			return this.SW //.then(sw => (this.SW = sw))
		} else {
			report('Seu navegador não suporta essa aplicação.')
			return false
		}
	}
}

const SWorker = new ClassServiceWorker()
