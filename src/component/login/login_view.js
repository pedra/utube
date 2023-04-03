
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