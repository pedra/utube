
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
                    <img loading="lazy" src="${v.thumbnail.high.url}" alt="${v.title}">
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