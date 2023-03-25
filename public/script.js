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


class ViewClass {

    page = 'home'
    splash = '#splash'
    stage = '#stage'
    gallery = '#gallery'
    media = '#stg-media'
    video = '#stg-video'
    btn_play = '.stg-play'
    btn_pause = '.stg-pause'
    btn_stop = '.stg-stop'
    btn_volume_off = '.stg-volume-off'
    btn_volume_on = '.stg-volume-on'

    constructor () {
    }

    chPage (p) {
        __('body').className = ''
        __('body').classList.add(p)
        if(localStorage.getItem('theme') == 'dark') __('body').classList.add('dark')
        this.page = p
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    splashShow (view = false) {
       __(this.splash).classList[view ? 'add' : 'remove']('on')
    }

    videoPlay (s) {
        __(this.btn_pause).classList[s ? 'remove' : 'add']('off')
        __(this.btn_play).classList[!s ? 'remove' : 'add']('off')
    }

    videoMute (m) {
        __(this.btn_volume_off).classList[m ? 'remove' : 'add']('off')
        __(this.btn_volume_on).classList[!m ? 'remove' : 'add']('off')
    }

    buildStage (videos) {        
        var i = videos.findIndex(a => a.id == '34')
        if(!i) __('body').innerHTML = '<div class="error">Sem rede!</div>'
        var s = __(this.stage)

        var v = videos[i]
        var tbn = v.thumbnail
        tbn = tbn.maxres ?? (tbn.standard ?? tbn.high)
        var d = v.description.substr(0, 100) + (v.description.length > 100 ? '...' : '')

        s.innerHTML = `<div class="stg-media" id="stg-${v.id}">
            <img src="${tbn.url}" alt="${v.title}">
        </div>
        <div class="stg-title" id="stg-title">
            <h1>${v.title}</h1>
            <div class="stg-play-button" onclick="Page.go('player', '${v.videoId}')">
                Play <span class="material-symbols-outlined stg-play">play_circle</span> now!
            </div>
            <div class="stg-info">
                <div title="views"><span class="material-symbols-outlined">visibility</span>${v.views}</div>
                <div title="likes"><span class="material-symbols-outlined">thumb_up</span>${v.likes}</div>
                <div title="duration"><span
                        class="material-symbols-outlined">schedule</span>${convTime(v.duration)[1]}</div>
                <div title="quality" class="quality">${v.definition}</div>
            </div>
            <div class="stg-description">${d}</div>
        </div>`
    }

    buildShop (videos) {
        var g = __(this.gallery)
        g.innerHTML = ''
        videos.map(v => {
            var d = v.description.substr(0, 100) + (v.description.length > 100 ? '...' : '')
            var h = `<div class="glr-item" id="v-${v.id}">
                <div class="glr-media">
                    <img src="${v.thumbnail.high.url}" alt="${v.title}">
                </div>
                <div class="glr-content">
                    <div class="glr-content-title">
                        <span class="material-symbols-outlined"
                            onclick="Page.go('player', '${v.videoId}')">play_circle</span>
                        <h2>${v.title}</h2>
                    </div>
                    <div class="glr-content-info">
                        <div title="views"><span class="material-symbols-outlined">visibility</span>${v.views}</div>
                        <div title="likes"><span class="material-symbols-outlined">thumb_up</span>${v.likes}</div>
                        <div title="duration"><span class="material-symbols-outlined">schedule</span>${convTime(v.duration)[1]}</div>
                        <div title="quality" class="quality">${v.definition}</div>
                    </div>
                    <div class="glr-content-description">${d}</div>
                </div>
            </div>`
            g.innerHTML += h
        })

        this.splashShow(false)
    }

    buildPlayer (d) {
        __(this.stage).innerHTML = `<div class="stg-media" id="stg-media">
            <div class="stg-video" id="stg-video"></div>
        </div>
        <div class="stg-title" id="stg-title">
            <h1>${d.title}</h1>
            <div class="stg-play-button">
                <span class="material-symbols-outlined stg-stop" onclick="Player.stop()">home</span>
                <span class="material-symbols-outlined stg-play off" onclick="Player.play()">play_circle</span>
                <span class="material-symbols-outlined stg-pause" onclick="Player.pause()">pause_circle</span>
                <span class="material-symbols-outlined stg-volume-off off" onclick="Player.unmute()">volume_off</span>
                <span class="material-symbols-outlined stg-volume-on" onclick="Player.mute()">volume_mute</span>
            </div>
            <div class="stg-info">
                <div title="views"><span class="material-symbols-outlined">visibility</span>${d.views}</div>
                <div title="likes"><span class="material-symbols-outlined">thumb_up</span>${d.likes}</div>
                <div title="duration"><span
                        class="material-symbols-outlined">schedule</span>${convTime(d.duration)[1]}</div>
                <div title="quality" class="quality">${d.definition}</div>
            </div>
            <div class="stg-description">${d.description}</div>
        </div>`
        return this
    }

}
class PageClass {
    videos = []
    channel = {}
    page = 'home'
    pages = {
        home:  (id, force) => Page.build(id, force),
        player: (id, force) => Player.build(id, force)
    }

    async init() {
        var t = await localStorage.getItem('theme')
        this.theme(!t || t == null ? 'light' : t)

        var v = await localStorage.getItem('videos')

        if (!v || v == null) {
            let r = await fetch('https://a.freedomee.org/ytb', {
                method: 'GET'
            })
            r = await r.json()
            if (!r.error && r.data.videos) {
                await localStorage.setItem('videos', JSON.stringify(r.data))
                this.videos = r.data.videos
                this.channel = r.data.channel
            }
        } else {
            v = JSON.parse(v)
            this.videos = v.videos
            this.channel = v.channel
        }

        // Montando a página Home
        this.go('home', 0, true)
        return this
    }

    go(p, id, force = false) {
        View.chPage(p)
        this.pages[p](id, force)
    }

    build (id, force) {
        View.buildStage(this.videos)
        if(force) setTimeout(() => View.buildShop(this.videos), 10)
    }

    theme(v) {
        var t = __('#theme span')
        var h = !v ? (t.innerHTML == 'dark_mode' ? 'light' : 'dark') : v
        t.innerHTML = h + '_mode'
        __('body').classList[h == 'dark' ? 'add' : 'remove']('dark')
        localStorage.setItem('theme', h)
    }

    report (msg) {
        console.log('REPORT', msg)
    }
}
class PlayerClass {

    id = null
    video = null
    

    build (id) { console.log('Player.build', id)
        var i = Page.videos.findIndex(a => a.videoId == id)
        if(i == -1) return Page.report(id)        

        View.buildPlayer(Page.videos[i])
        this.mount (id, __(View.video))
    }

    mount(id, target) {
        this.id = id
        this.video = new YT.Player(target, {
            height: '100%',
            width: '100%',
            videoId: this.id, //'vH6hEO7URHY',
            playerVars: {
                'controls': 0,
            },
            events: {
                'onReady': this.ready,
                'onStateChange': this.stateChange
            }
        })
    }

    close() {
        this.video.destroy()
    }

    stop() {
        this.video.stopVideo()
        Page.go('home')
        this.video.destroy()
    }

    play() {
        this.video.playVideo()
        View.videoPlay(true)
    }

    pause() {
        this.video.pauseVideo()
        View.videoPlay(false)
    }

    mute () {
        this.video.mute()
        View.videoMute(true)
    }

    unmute () {
        this.video.unMute()
        View.videoMute(false)
    }

    ready(e) {
        e.target.seekTo(0)
        //e.target.playVideo()
        //e.target.mute()
        e.target.setLoop(true)
        e.target.setPlaybackQuality('hd1080')
        //e.target.stopVideo()
    }

    stateChange(e) {
        if(e.data == 0) Player.stop()
        //console.log('State change', e.data)
    }
}
let View, 
    Page, 
    Player,
    SW = SWorker.init()

window.onload = () => {
    View = new ViewClass
    
    Page = new PageClass
    Page.init()

    Player = new PlayerClass
}