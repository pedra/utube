
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