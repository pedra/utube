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