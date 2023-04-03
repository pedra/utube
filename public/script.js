class ClassConfig {
	lang_flag_url = APP_URL_MEDIA + '/flag'

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
				let l = await fetch(`${APP_URL_LANG}/${lang}.json`)
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

const APP_ID = '001',
	APP_VERSION = '0.0.1',
    
    APP_URL = 'https://freedomee.org',
    //APP_URL = 'http://localhost',
    APP_URL_MEDIA = APP_URL + '/media',
    APP_URL_LANG = APP_URL + '/lang',

    API_URL = 'https://a.freedomee.org',
    //API_URL = 'http://localhost:3000',
    API_URL_GATE = API_URL + '/gate',
    API_URL_KEY = API_URL_GATE + '/key'

const Config = null // = new ClassConfig()

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

    buildStage (videos, video) {        
        var i = videos.findIndex(a => a.videoId == video)
        if(i == -1) return App.report('No videos!')
        var s = __(this.stage)

        var v = videos[i]
        var tbn = v.thumbnail
        tbn = tbn.maxres ?? (tbn.standard ?? tbn.high)
        var d = v.description.substr(0, 600) + (v.description.length > 600 ? '...' : '')

        s.innerHTML = `<div class="stg-media" id="stg-${v.id}">
            <img src="${tbn.url}" alt="${v.title}">
        </div>
        <div class="stg-title" id="stg-title">
            <h1>${v.title}</h1>
            <a href="/v/${v.videoId}" class="stg-play-button">
                Play <span class="material-symbols-outlined stg-play">play_circle</span> now!
            </a>
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
                        <a href="/v/${v.videoId}"><span class="material-symbols-outlined">play_circle</span></a>
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
                <span class="material-symbols-outlined stg-play pulse off" onclick="Player.play()">play_circle</span>
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

const View = new ViewClass
class PageClass {
    videos = []
    video = 'jg4drWqu9l4'
    channel = {}
    page = 'home'
    path = ''
    data = ''
    pages = {
        home: (d, e) => Page.build(d, e),
        player: (d, e) => Player.build(d, e),
        login: (d, e) => Login.build(d, e)
    }

    link = [
        { url: '', page: 'home', title: 'Freedomee' },
        { url: 'v', page: 'player', title: 'Freedomee' },
        { url: 'login', page: 'login', title: 'Freedomee::Login' }
    ]

    constructor() {
        var a = location.pathname.split('/').slice(1)
        var u = a.shift()
        var d = a.shift()
        var l = this.searchLink(u, 'url')
        this.page = 'home'//l.page

        var t = { url: '', page: 'root', title: 'Freedomee' }
        history.pushState(t, t.title, t.url)
        history.pushState(t, t.title, t.url)

        this.init().then(i => {
            View.chPage(this.page)
            setTimeout(() => View.buildShop(this.videos), 10)            
            this.pages[this.page](d, true)

            navigation.onnavigate = this.navigate
            // Reagindo a ação do botão VOLTAR do navegador
            window.onpopstate = this.onpopstate
        })
    }

    onpopstate(e) {
        e.preventDefault()
        console.log('POP', history.state, e.state)
        if(e.state == null) return 

        history.replaceState({p: 'login'}, '', '/')
    }

    navigate(e) { //return false
        console.log('navigate', e.destination.url)
        e.preventDefault()
        let a = e.destination.url.replace(location.origin, '').replace('/', '').split('/')
        var u = a.shift()
        var d = a.shift()
        var l = Page.searchLink(u, 'url')

        if(l.page == 'login') {
            Page.pages['login']()
            return false
        }

        Page.page = l.page
        View.chPage(Page.page)
        Page.pages[l.page](d, true)
    }

    searchLink(n, i = 'page') {
        var i = this.link.findIndex(a => a[i] === n)
        if(i == -1){
            i = 0
            history.replaceState(this.link[0], this.link[0].title, this.link[0].url)            
        }
        return this.link[i]
    }

    async init() {
        var t = localStorage.getItem('theme')
        this.theme(!t || t == null ? 'light' : t)

        var v = localStorage.getItem('videos')

        if (!v || v == null) {
            let r = await fetch('https://a.freedomee.org/ytb', {
                method: 'GET'
            })
            r = await r.json()
            if (!r.error && r.data.videos) {
                localStorage.setItem('videos', JSON.stringify(r.data))
                this.videos = r.data.videos
                this.channel = r.data.channel
            }
        } else {
            v = JSON.parse(v)
            this.videos = v.videos
            this.channel = v.channel
        }
        return this
    }

    go(p, data) {
        var l = this.searchLink(p, 'page')
        this.page = l.page
        View.chPage(this.page)
        this.pages[l.page](data)
    }

    build(video = false, force = false) {
        View.buildStage(this.videos, video || this.video)
        if (force) setTimeout(() => View.buildShop(this.videos), 10)
    }

    theme(v) {
        var t = __('#theme span')
        var h = !v ? (t.innerHTML == 'dark_mode' ? 'light' : 'dark') : v
        t.innerHTML = h + '_mode'
        __('body').classList[h == 'dark' ? 'add' : 'remove']('dark')
        localStorage.setItem('theme', h)
    }

    report(msg) {
        console.log('REPORT', msg)
    }
}
class PlayerClass {

    id = null
    video = null    

    build (id, stopped) {
        var i = Page.videos.findIndex(a => a.videoId == id)
        if(i == -1) return Page.report(id)        

        View.buildPlayer(Page.videos[i], stopped)
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

const Player = new PlayerClass


class StageClass {

    constructor () {

    }

    htmlId = '#stage'

    mount (videos, video) {        
        var i = videos.findIndex(a => a.videoId == video)
        if(i == -1) return App.report('No videos!')
        var s = __(this.htmlId)

        var v = videos[i]
        var tbn = v.thumbnail
        tbn = tbn.maxres ?? (tbn.standard ?? tbn.high)
        var d = v.description.substr(0, 600) + (v.description.length > 600 ? '...' : '')

        s.innerHTML = `<div class="stg-media" id="stg-${v.id}">
            <img src="${tbn.url}" alt="${v.title}">
        </div>
        <div class="stg-title" id="stg-title">
            <h1>${v.title}</h1>
            <a href="/v/${v.videoId}" class="stg-play-button">
                Play <span class="material-symbols-outlined stg-play">play_circle</span> now!
            </a>
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
}

const Stage = new StageClass()

class LoginViewClass {

    htmlId = '#login'
    loginId = '#log-form'
    logEmail = '#log-email'
    logPassw = '#log-passw'
    logCheck = '#log-check'

    constructor () {
        
    }

    mount () {
        __(this.htmlId).innerHTML = 
        `<div class="log-login" id="log-form">
            <form class="log-form">
                <div class="form-group">
                    <label for="log-email">Email address</label>
                    <input type="email" id="log-email" placeholder="Enter email">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="log-passw" placeholder="Password">
                </div>
                <div class="form-group form-check">
                    <input type="checkbox" id="log-check">
                    <label for="log-check">I agree to the terms of service.</label>
                </div>
                <div class="form-group">
                    <button type="submit">Sign in</button>
                </div>
            </form>
        </div>`
        setTimeout(() => __(this.htmlId + ' form').onsubmit = Login.submit, 10)
    }

    show () {
        __(this.htmlId).classList.add('on')
        setTimeout(() => __(this.loginId).classList.add('on'), 10)
    }

    hide () {
        __(this.loginId).classList.remove('on')
        setTimeout(() => __(this.htmlId).classList.remove('on'), 600)
    }

    getForm () {
        let data = {
            email: __(this.logEmail).value,
            passw: __(this.logPassw).value,
            check: __(this.logCheck).checked
        }

        if(data.email.length < 1) {
            report('Email is empty!')
            return false
        }

        if(data.passw.length < 1) {
            report('Password is empty!')
            return false
        }

        if(data.check == false) {
            report('You must agree to the terms of service!')
            return false
        }

        return data
    }
    

    clear () {
        __(this.logEmail).value = ''
        __(this.logPassw).value = ''
        __(this.logCheck).checked = false
    }



}

const LogView = new LoginViewClass()

class LoginClass {

    geo = ''
    rsa = ''
    ukey = ''
    token = ''


    constructor() {
        this.getGeo()
        this.ukey = rpass()
    }


    build() {
        LogView.show()
    }

    async submit(e) {
        e.preventDefault()
        let data = LogView.getForm()

        if (!data) return false

        // RSA ...
        await Login.getPublicKey()
        var d = Login.rsaEncode(data)

        // Send ...
        glass(true)
        var a = await Conn.post('gate/login', d, 'text', 'text')
        glass(false)

        if(!a) {
            LogView.clear()
            LogView.hide()
            return report('Network unavailable!')            
        }

        a = Login.decodeAes(a)

        if(!a) return report('Invalid login or password.')
        report (`Welcome back ${a.first_name + ' ' + a.last_name}!`)

        Login.ukey = a.ukey
        Login.token = a.token
        LogView.hide()
        LogView.clear()
    }

    async getPublicKey() {
        var k = await fetch(API_URL_KEY)
        this.rsa = await k.text()
    }

    rsaEncode(data) {
        var d = {
            app: APP_ID,
            version: APP_VERSION,

            login: data.email,
            passw: data.passw,

            ukey: Login.ukey,
            geo: Login.geo
        }

        // Criptografando rsa
        return RSA.encrypt(JSON.stringify(d), RSA.getPublicKey(Login.rsa))
    }

    decodeAes(data) {
        var a
        try {
            a = JSON.parse(decrypt(data, Login.ukey))
        } catch (e) { console.log(e)
            a = false
        }
        return a
    }

    // Get Geo
    getGeo() {
        if (!navigator.geolocation) return false
        navigator.geolocation.getCurrentPosition(
            a => this.geo = a.coords.latitude + '|' + a.coords.longitude)
    }

}

const Login = new LoginClass()

class ShopClass {
    constructor () {

    }
}

const Shop = new ShopClass()


let App, Page

class AppClass {
    constructor() { }

    report(text, type, extra, tempo) {
        return report(text, type, extra, tempo)
    }
}

App = new AppClass()

window.onload = () => {

    Page = new PageClass()
    LogView.mount()

}