import './src/minesweeper.css'
import { Minefield } from './minefield.mjs'
import { Timer } from './timer.mjs'

class GameState {
    static hasGameStarted = false
    static isGameInProgress = false
    static isGameWon = false
    static isGameLost = false
    static isGameOver = true
}

/**
 * TODO: Minesweeper has a few default difficulties that should be implemented.
 * 8x8 - 10 mines
 * 16x16 - 40 mines
 * 30x16 - 99 mines
 */
const defaultOptions = {
    height: 10,
    mineDensity: 0.15,
    width: 10,
}

const Events = {
    gameCreated: new Event('game-created.tlc.minesweeper'),
    gameReady: new Event('game-ready.tlc.minesweeper'),
    gameWon: new Event('game-won.tlc.minesweeper'),
    gameLost: new Event('game-lost.tlc.minesweeper'),

    cellClicked: new Event('cell-clicked.tlc.minesweeper'),
}

export default class Minesweeper {
    #gameContainer = undefined
    #options = {}
    #minefield = undefined
    #hasEnded = undefined
    #gameTimer = undefined

    constructor(containerSelector, gameOptions) {
        this.#setupContainer(containerSelector)

        Object.assign(this.#options, defaultOptions, gameOptions)

        this.#validateOptions()

        this.#createActionBar()

        
        this.#createGame()

        this.#setupEventHandlers()
    }

    #setupContainer(selector) {
        this.#gameContainer = document.querySelector(selector)
        if (this.#gameContainer === null) {
            throw new Error(`No element could be found with the given selector (${selector})`)
        }
        this.#gameContainer.classList.add('minesweeper-game-container')
    }

    #validateOptions() {
        /**
         * Height
         * ------
         * Number
         * Whole Number
         * Positive
         */
        if (
            typeof this.#options.height !== 'number' // Numerical
            || this.#options.height % 1 !== 0 // Whole Number
            || this.#options.height <= 0 // Positive
            ) {
            throw new Error(`options.height must be a positive whole number`)
        }

        /**
         * Width
         * ------
         * Number
         * Whole Number
         * Positive
         */
        if (
            typeof this.#options.width !== 'number' // Numerical
            || this.#options.width % 1 !== 0 // Whole Number
            || this.#options.width <= 0 // Positve
            ) {
            throw new Error(`options.width must be a positive whole number`)
        }

        /**
         * Mine Density
         * ------
         * Number
         * Greater than 0
         * Less than 1
         */
        if (
            typeof this.#options.mineDensity !== 'number' // Numerical
            || this.#options.mineDensity <= 0 // Greater than 0
            || this.#options.mineDensity >= 1 // Less than 1
            ) {
            throw new Error(`options.height must be a number between 0 and 1`)
        }
    }

    #createActionBar() {

    }

    #createInfoBar() {
        const infoContainer = document.createElement('div')
        infoContainer.classList.add('info-bar')

        // Total Mines
        const mineInfoContainer = document.createElement('div')
        mineInfoContainer.setAttribute('title', `Total Mines`)
        mineInfoContainer.classList.add('info-box')
        const mineIcon = document.createElement('div')
        mineIcon.innerHTML = '\u{1F4A3}'
        const mineCount = document.createElement('span')
        mineCount.setAttribute('name', 'mine-count')
        const totalMines = this.#minefield.getTotalMines()
        mineCount.setAttribute('data-count', totalMines)
        mineCount.innerText = totalMines

        mineInfoContainer.append(mineIcon)
        mineInfoContainer.append(mineCount)

        // Total Flags
        const flagInfoContainer = document.createElement('div')
        flagInfoContainer.setAttribute('title', `Total Flags`)
        flagInfoContainer.classList.add('info-box')
        const flagIcon = document.createElement('div')
        flagIcon.innerHTML = '\u{26A0}'
        const flagCount = document.createElement('span')
        flagCount.setAttribute('name', 'flag-count')
        flagCount.setAttribute('data-count', 0)
        flagCount.innerText = 0

        flagInfoContainer.append(flagIcon)
        flagInfoContainer.append(flagCount)

        infoContainer.append(mineInfoContainer)
        infoContainer.append(flagInfoContainer)

        this.#gameContainer.append(infoContainer)
    }

    #createBoard() {
        this.#minefield = new Minefield(this.#gameContainer, this.#options)
    }

    #setupEventHandlers() {
        this.#gameContainer.addEventListener('click', (event) => {
            if (GameState.isGameOver) {
                return
            }
            if (!GameState.hasGameStarted) {
                GameState.hasGameStarted = true
                this.#gameTimer.start()
            }

            const target = event.target

            if (target.localName === 'td') {
                target.dispatchEvent(new CustomEvent('click.tlc.minesweeper', {
                    bubbles: false,
                }))
            }
        })

        this.#gameContainer.addEventListener('contextmenu', (event) => {
            event.preventDefault()
            const target = event.target

            if (target.localName === 'td') {
                target.dispatchEvent(new CustomEvent('right-click.tlc.minesweeper', {
                    bubbles: false,
                }))
            }
        })

        this.#gameContainer.addEventListener('game-lost.tlc.minesweeper', (_event) => {
            this.#triggerGameLost()
        })

        this.#gameContainer.addEventListener('game-won.tlc.minesweeper', (_event) => {
            this.#triggerGameWon()
        })

        this.#gameContainer.addEventListener('flag-set.tlc.minesweeper', (_event) => {
            const flagCountElement = this.#gameContainer.querySelector('.info-bar span[name="flag-count"]')
            const count = parseInt(flagCountElement.getAttribute('data-count'))
            flagCountElement.setAttribute('data-count', count + 1)
            flagCountElement.innerText = count + 1
        })

        this.#gameContainer.addEventListener('flag-unset.tlc.minesweeper', (_event) => {
            const flagCountElement = this.#gameContainer.querySelector('.info-bar span[name="flag-count"]')
            const count = parseInt(flagCountElement.getAttribute('data-count'))
            flagCountElement.setAttribute('data-count', count - 1)
            flagCountElement.innerText = count - 1
        })
    }

    newGame() {
        this.#createGame()
    }

    changeOptions(newOptions) {
        Object.assign(this.#options, newOptions)
        this.#validateOptions()

        console.debug('change options', {
            new: newOptions,
            current: this.#options,
        })
    }

    #createGame() {
        this.#gameContainer.innerHTML = ''
        GameState.isGameInProgress = true

        this.#createBoard()
        
        this.#gameTimer = new Timer()

        
        // Info Container
        this.#createInfoBar()
        
        // Minefield
        const fieldContainer = document.createElement('div')
        fieldContainer.classList.add('__minefield-container')
        fieldContainer.append(this.#minefield.getElement())
        
        this.#gameContainer.append(fieldContainer)
        this.#gameContainer.dispatchEvent(Events.gameReady)

        GameState.isGameOver = false
    }

    #triggerGameWon() {
        GameState.isGameInProgress = false
        GameState.isGameWon = true
        GameState.isGameOver = true
        this.#gameTimer.stop()
        this.#gameContainer.dispatchEvent(new CustomEvent('game-won.minesweeper', {
            bubbles: true,
            detail: {},
        }))
    }

    #triggerGameLost() {
        GameState.isGameInProgress = false
        GameState.isGameWon = false
        GameState.isGameOver = true
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

    triggerCell(row, col) {
        this.#gameContainer.querySelector(`td#cell-${row}-${col}`).click()
    }

    toggleFlag(row, col) {
        this.#gameContainer.querySelector(`td#cell-${row}-${col}`).dispatchEvent(new CustomEvent('contextmenu'))
    }
}