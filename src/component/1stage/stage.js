

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