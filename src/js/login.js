
class LoginClass {


    constructor () {

    }

    build () {
        LogView.show()
    }

    submit (e) {
        e.preventDefault()
        LogView.hide()
        let data = LogView.getForm()
        console.log('Login', data)

        LogView.clear()
        return false
    }
}

const Login = new LoginClass()