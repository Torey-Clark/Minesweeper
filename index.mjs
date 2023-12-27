import './src/minesweeper.css'
import { Minefield } from './minefield.mjs'
import { Timer } from './timer.mjs'

const defaultOptions = {
    mineDensity: 0.20,
    size: 10,
}

const Events = {
    gameCreated: new Event('game-created.tlc.minesweeper'),
    gameReady: new Event('game-ready.tlc.minesweeper'),
    gameWon: new Event('game-won.tlc.minesweeper'),
    gameLost: new Event('game-lost.tlc.minesweeper'),

    cellClicked: new Event('cell-clicked.tlc.minesweeper'),
}

export class Minesweeper {
    #gameContainer = undefined
    #options = undefined
    #minefield = undefined
    #hasStarted = undefined
    #hasEnded = undefined
    #gameTimer = undefined

    constructor(containerId, gameOptions = defaultOptions) {
        this.#gameContainer = document.getElementById(containerId)
        this.#gameContainer.className = 'minesweeper-game-container'
        this.#options = { ...defaultOptions, ...gameOptions } // Merge the default options with the user's options
        this.#validateOptions()
        console.debug(`[DEBUG] Creating Minesweeper Game`, {
            containerId: containerId,
            container: this.#gameContainer,
            defaultOptions: defaultOptions,
            userOptions: gameOptions,
            finalOptions: this.#options,
        })

        // Bind "this" for the event handlers
        this.handleCellClicked = this.#handleCellClicked.bind(this)
        this.handleGameLost = this.#handleGameLost.bind(this)
        this.handleGameWon = this.#handleGameWon.bind(this)

        this.#createGame()
    }

    #validateOptions() {
        // mineDensity
        if (
            parseFloat(this.#options.mineDensity) === NaN ||
            this.#options.mineDensity <= 0 ||
            this.#options.mineDensity >= 1
        ) {
            throw new Error("The option \"mineDensity\" must a number between 0 and 1 exclusive.")
        }

        // size
        if (
            parseInt(this.#options.size) === NaN
        ) {
            throw new Error("The option \"size\" must be a number.")
        }
    }

    newGame() {
        this.#createGame()
    }

    changeSize(size) {
        this.#options.size = size
        this.#validateOptions()
        this.#createGame()
    }

    #createGame() {
        this.#gameContainer.innerHTML = ''
        this.#hasStarted = false
        this.#hasEnded = false
        this.#minefield = new Minefield(this.#options.size, this.#options.mineDensity)
        this.#gameTimer = new Timer()

        this.#gameContainer.removeEventListener('cell-clicked.tlc.minesweeper', this.handleCellClicked)
        this.#gameContainer.addEventListener('cell-clicked.tlc.minesweeper', this.handleCellClicked)
        this.#gameContainer.removeEventListener('game-lost.tlc.minesweeper', this.handleGameLost)
        this.#gameContainer.addEventListener('game-lost.tlc.minesweeper', this.handleGameLost)
        this.#gameContainer.removeEventListener('game-won.tlc.minesweeper', this.handleGameWon)
        this.#gameContainer.addEventListener('game-won.tlc.minesweeper', this.handleGameWon)

        this.#gameContainer.dispatchEvent(Events.gameReady)

        // Info Container
        const infoContainer = document.createElement('div')
        infoContainer.classList.add('__info-container')
        const totalMinesElement = document.createElement('span')
        const totalMines = this.#minefield.getTotalMines()
        totalMinesElement.innerHTML = `There ${totalMines !== 1 ? `are ${totalMines} mines ` : `is 1 mine`} on the board.`
        infoContainer.append(totalMinesElement)

        // Minefield
        const fieldContainer = document.createElement('div')
        fieldContainer.classList.add('__minefield-container')
        fieldContainer.append(this.#minefield.getElement())

        this.#gameContainer.append(infoContainer)
        this.#gameContainer.append(fieldContainer)
    }

    #handleCellClicked() {
        if (!this.#hasStarted) {
            this.#hasStarted = true
            this.#gameTimer.start()
        }
    }

    #handleGameWon(event) {
        console.debug(`[DEBUG] Handling Game Won`, {
            event: event,
        })
        this.#gameContainer.dispatchEvent(new CustomEvent('game-won.minesweeper', {
            bubbles: true,
            detail: {},
        }))
    }

    #handleGameLost(event) {
        console.debug(`[DEBUG] Handling Game Lost`, {
            event: event,
        })
        this.#gameTimer.stop()
        this.#hasEnded = true
        this.#gameContainer.dispatchEvent(new CustomEvent('game-lost.minesweeper', {
            bubbles: true,
            detail: {},
        }))
    }

    on(event, callback) {
        this.#gameContainer.addEventListener(event, callback)
    }
}