
class LoginClass {

    constructor() {
        this.getGeo()
        APP.key = rpass()
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

        APP.key = a.key
        APP.token = a.token
        LogView.hide()
        LogView.clear()
    }

    async getPublicKey() {
        APP.rsa = await Conn.get(API_URL_KEY, false, 'text')
    }

    rsaEncode(data) {
        var d = {
            app: APP.id,
            version: APP.version,
            key: APP.key,
            geo: APP.geo,

            login: data.email,
            passw: data.passw            
        }

        // Criptografando rsa
        return RSA.encrypt(JSON.stringify(d), RSA.getPublicKey(APP.rsa))
    }

    decodeAes(data) {
        var a
        try {
            a = JSON.parse(decrypt(data, APP.key))
        } catch (e) { console.log(e)
            a = false
        }
        return a
    }

    // Get Geo
    getGeo() {
        if (!navigator.geolocation) return false
        navigator.geolocation.getCurrentPosition(
            a => APP.geo = a.coords.latitude + '|' + a.coords.longitude)
    }

}

const Login = new LoginClass()