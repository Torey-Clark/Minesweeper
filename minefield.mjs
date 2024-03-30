import { Cell } from "./cell.mjs"

const defaultOptions = {
    height: 10,
    mineDensity: 0.1,
    width: 10,
}

export class Minefield {
    #activeCells = 0
    #totalMines = 0

    #minefield = undefined
    #mineDensity = undefined

    #minefieldElement = undefined

    #options = {}

    constructor(container, options) {
        Object.assign(this.#options, defaultOptions, options)

        this.#validateOptions()

        this.#mineDensity = this.#options.mineDensity
        this.#totalMines = Math.ceil(this.#options.height * this.#options.width * this.#mineDensity)

        this.#minefieldElement = document.createElement('table')
        this.#setupEventListeners()
        this.#createMinefield()
        this.#plantMines()
    }

    /**
     * Validate Options
     * Ensures that the given options are valid by throwing errors when a required option is invalid
     */
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

    getElement() {
        return this.#minefieldElement
    }

    getTotalMines() {
        return this.#totalMines
    }

    #createMinefield() {
        const minefield = []
        this.#minefieldElement.innerHTML = ''
        this.#minefieldElement.className = 'minefield'

        // const maxCellHeight = Math.round((window.innerHeight - 20) / this.#options.height)
        // const maxCellWidth = Math.round((window.innerWidth - 20) / this.#options.width)
        // console.debug(`sizes`, {
        //     inner: {
        //         h: window.innerHeight,
        //         w: window.innerWidth,
        //     },
        //     minefield: {

        //     }
        // })

        // const cellLength = Math.min(maxCellHeight, maxCellWidth)
        
        for (let rowIndex = 0; rowIndex < this.#options.height; rowIndex++) {
            const row = []
            const tableRow = document.createElement('tr')
            for (let colIndex = 0; colIndex < this.#options.width; colIndex++) {
                const cell = new Cell(rowIndex, colIndex)
                row.push(cell)
                // TODO: Can we auto size the cells to be a large size while the entire minefield can fit on the device screen
                // cell.getElement().style['width'] = `${cellLength}px`
                // cell.getElement().style['max-width'] = `${cellLength}px`
                // cell.getElement().style['height'] = `${cellLength}px`
                // cell.getElement().style['max-height'] = `${cellLength}px`
                tableRow.append(cell.getElement())
            }
            minefield.push(row)
            this.#minefieldElement.append(tableRow)
        }

        this.#minefield = minefield
    }

    #plantMines() {
        for (let minesPlanted = 0; minesPlanted < this.#totalMines; minesPlanted++) {
            this.#plantSingleMine()
        }
    }

    #plantSingleMine() {
        const randomRow = Math.floor(Math.random() * this.#options.height)
        const randomCol = Math.floor(Math.random() * this.#options.width)

        if (!this.#minefield[randomRow][randomCol].hasMine()) {
            this.#minefield[randomRow][randomCol].plantMine()
            this.#updateAdjacentMines(randomRow, randomCol)
        } else {
            this.#plantSingleMine()
        }
    }

    #updateAdjacentMines(row, col) {
        for (let rowIndex = Math.max(0, row - 1); rowIndex <= Math.min(this.#options.height - 1, row + 1); rowIndex++) {
            for (let colIndex = Math.max(0, col - 1); colIndex <= Math.min(this.#options.width - 1, col + 1); colIndex++) {
                if (rowIndex !== row || colIndex !== col) {
                    this.#minefield[rowIndex][colIndex].incrementAdjacentMineCount()
                }
            }
        }
    }

    #setupEventListeners() {
        this.#minefieldElement.addEventListener('cell-clicked.tlc.minesweeper', (event) => {
            const col = event.detail.col
            const row = event.detail.row
            const cell = this.#minefield[row][col]

            if (cell.isActive()) {
                return true
            }

            const adjacentMinesCount = cell.getAdjacentMinesCount()
            cell.activate()
            this.#activeCells++

            if (cell.hasMine()) {
                this.#minefieldElement.dispatchEvent(new CustomEvent('game-lost.tlc.minesweeper', {
                    bubbles: true,
                    detail: {},
                }))
            } else if (this.#activeCells === this.#options.height * this.#options.width - this.#totalMines) {
                this.#minefieldElement.dispatchEvent(new CustomEvent('game-won.tlc.minesweeper', {
                    bubbles: true,
                    detail: {},
                }))
            } else if (adjacentMinesCount === 0) {
                for (let rowIndex = Math.max(0, row - 1); rowIndex <= Math.min(this.#options.height - 1, row + 1); rowIndex++) {
                    for (let colIndex = Math.max(0, col - 1); colIndex <= Math.min(this.#options.width - 1, col + 1); colIndex++) {
                        // console.debug(`[+] (${rowIndex}, ${colIndex})`)
                        if (rowIndex !== row || colIndex !== col) {
                            // this.#minefield[rowIndex][colIndex].getElement().click()
                            this.#minefield[rowIndex][colIndex].getElement().dispatchEvent(new CustomEvent('click.tlc.minesweeper', {
                                bubbles: false,
                            }))
                        }
                    }
                }
            }
        })
    }
}