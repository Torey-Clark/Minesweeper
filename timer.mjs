export class Timer {
    #timeInMilliseconds = undefined
    #timeout = undefined
    #isStopped = undefined
    #element = undefined

    constructor() {
        this.#timeInMilliseconds = 0
        this.#isStopped = true
        this.#createElement()
    }

    #createElement() {
        const element = document.createElement('span')
        element.innerHTML = this.toString()
        this.#element = element
    }

    #updateElement() {
        this.#element.innerHTML = this.toString()
    }

    toString() {
        return `${this.#timeInMilliseconds / (1000 * 60 * 60)}:${this.#timeInMilliseconds / (1000 * 60)}:${this.#timeInMilliseconds / 1000}.${this.#timeInMilliseconds % 1000}`
    }
    
    start() {
        if (this.#isStopped) {
            return
        }
        
        const delayInMilliseconds = 10
        this.#timeout = setTimeout(() => {
            this.#timeInMilliseconds += delayInMilliseconds
            this.#updateElement()
            this.start()
        }, delayInMilliseconds)
    }

    resume() {
        this.#isStopped = false
        this.start()
    }

    stop() {
        this.#isStopped = true
    }

    reset() {
        if (this.#timeout) {
            clearTimeout(this.#timeout)
        }
        this.#timeInMilliseconds = 0
        this.#isStopped = true
    }
}