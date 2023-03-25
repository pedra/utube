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