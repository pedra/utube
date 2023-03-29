class PageClass {
    videos = []
    video = 'jg4drWqu9l4'
    channel = {}
    page = 'home'
    path = ''
    data = ''
    pages = {
        home: (d, e) => Page.build(d, e),
        player: (d, e) => Player.build(d, e)
    }

    link = [
        { url: '', page: 'home', title: 'Freedomee' },
        { url: 'v', page: 'player', title: 'Freedomee' }
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
        })
    }

    navigate(e) { //return false
        e.preventDefault()
        let a = e.destination.url.replace(location.origin, '').replace('/', '').split('/')
        var u = a.shift()
        var d = a.shift()
        var l = Page.searchLink(u, 'url')

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