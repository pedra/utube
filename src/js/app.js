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

}