import { Cell } from "./cell.mjs"

export class Minefield {
    #activeCells = 0
    #size = 0
    #cells = undefined
    #totalMines = 0
    #gameWon = false

    #minefield = undefined
    #mineDensity = undefined

    #minefieldElement = undefined

    constructor(size, mineDensity) {
        this.#size = size
        this.#mineDensity = mineDensity
        this.#totalMines = Math.floor(this.#size * this.#size * this.#mineDensity)
        this.handleCellClicked = this.#handleCellClicked.bind(this)

        this.#createMinefield()
        this.#plantMines()
    }

    getElement() {
        return this.#minefieldElement
    }

    getTotalMines() {
        return this.#totalMines
    }

    #createMinefield() {
        const minefield = []
        const minefieldTable = document.createElement('table')
        minefieldTable.className = 'minefield'
        for (let rowIndex = 0; rowIndex < this.#size; rowIndex++) {
            const row = []
            const tableRow = document.createElement('tr')
            for (let colIndex = 0; colIndex < this.#size; colIndex++) {
                const cell = new Cell(rowIndex, colIndex)
                row.push(cell)
                tableRow.append(cell.getElement())
            }
            minefield.push(row)
            minefieldTable.append(tableRow)
        }
        this.#minefieldElement = minefieldTable
        this.#minefieldElement.addEventListener('cell-clicked.tlc.minesweeper', this.handleCellClicked)
        this.#minefield = minefield
    }

    #plantMines() {
        for (let minesPlanted = 0; minesPlanted < this.#totalMines; minesPlanted++) {
            this.#plantSingleMine()
        }
    }

    #plantSingleMine() {
        const randomRow = Math.floor(Math.random() * this.#size)
        const randomCol = Math.floor(Math.random() * this.#size)

        if (!this.#minefield[randomRow][randomCol].hasMine()) {
            this.#minefield[randomRow][randomCol].plantMine()
            this.#updateAdjacentMines(randomRow, randomCol)
        } else {
            this.#plantSingleMine()
        }
    }

    #updateAdjacentMines(row, col) {
        for (let rowIndex = Math.max(0, row - 1); rowIndex <= Math.min(this.#size - 1, row + 1); rowIndex++) {
            for (let colIndex = Math.max(0, col - 1); colIndex <= Math.min(this.#size - 1, col + 1); colIndex++) {
                if (rowIndex !== row || colIndex !== col) {
                    this.#minefield[rowIndex][colIndex].incrementAdjacentMineCount()
                }
            }
        }
    }

    #handleCellClicked(event) {
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
        } else if (this.#activeCells === this.#size * this.#size - this.#totalMines) {
            this.#gameWon = true
            this.#minefieldElement.dispatchEvent(new CustomEvent('game-won.tlc.minesweeper', {
                bubbles: true,
                detail: {},
            }))
        } else if (adjacentMinesCount === 0) {
            for (let rowIndex = Math.max(0, row - 1); rowIndex <= Math.min(this.#size - 1, row + 1); rowIndex++) {
                for (let colIndex = Math.max(0, col - 1); colIndex <= Math.min(this.#size - 1, col + 1); colIndex++) {
                    console.debug(`[+] (${rowIndex}, ${colIndex})`)
                    if (rowIndex !== row || colIndex !== col) {
                        this.#minefield[rowIndex][colIndex].getElement().click()
                    }
                }
            }
        }
    }
}