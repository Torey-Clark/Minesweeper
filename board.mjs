import { Cell } from "./cell.mjs"

export class Board {
    #activeCells = 0
    #size = 0
    #cells = undefined
    #totalMines = 0
    #gameWon = false

    constructor(size, difficulty) {
        this.#size = size
        console.info(`[INFO] Creating a new board of ${size * size} cells with a ${difficulty}% chance of a cell containing a mine.`)
        let attempts = 0
        do {
            console.debug(`[DEBUG] Attempt #${++attempts}`)
            this.#createBoard(size, difficulty)
        } while(this.#totalMines === 0 || this.#totalMines > size * size * 0.5) // We need at least 1 mine and no more than half of the board should be mines
        console.info(`[INFO] The board has been created.`)
        this.#showBoard()
    }

    #createBoard(size, difficulty) {
        this.#cells = []
        for (let rowIndex = 0; rowIndex < size; rowIndex++) {
            const rowCells = []
            for (let colIndex = 0; colIndex < size; colIndex++) {
                const hasMine = Math.floor(Math.random() * difficulty) === 0
                rowCells.push(new Cell(rowIndex, colIndex, hasMine))
                if (hasMine) {
                    console.debug(`[DEBUG] Cell (${rowIndex}, ${colIndex}) has a mine!`)
                    this.#totalMines++
                }
            }
            this.#cells.push(rowCells)
        }
    }

    isGameWon() {
        return this.#gameWon
    }

    #showBoard() {
        const debugArray = []
        const visualBoard = []
        this.#cells.forEach((row) => {
            const debugColDisplayCells = []
            const visualDisplayCells = []
            row.forEach((cell) => {
                debugColDisplayCells.push(`${cell.hasMine() ? 'X': ' '}`)
                visualDisplayCells.push(cell.getIcon())
            })
            debugArray.push(debugColDisplayCells)
            visualBoard.push(visualDisplayCells)
        })
        console.table(debugArray)
        console.table(visualBoard)
    }

    showBoardState() {
        const visualBoard = []
        this.#cells.forEach((row) => {
            const visualDisplayCells = []
            row.forEach((cell) => {
                visualDisplayCells.push(cell.getIcon())
            })
            visualBoard.push(visualDisplayCells)
        })
        console.info(`There are ${this.#totalMines} in the field.`)
        console.table(visualBoard)
    }

    activateCell(rowIndex, colIndex) {
        console.debug(`[DEBUG] row: ${rowIndex}, col: ${colIndex}`)
        if (this.#cells[rowIndex][colIndex].isActive()) {
            console.debug(`[DEBUG] The cell has already been activated.`)
            return true
        }
        if (this.#cells[rowIndex][colIndex].hasMine()) {
            // Game Over
            return false
        }

        let minesInNeighboringCells = 0
        const rowLimit = Math.min(rowIndex + 1, this.#size - 1)
        const colLimit = Math.min(colIndex + 1, this.#size - 1)
        for (let row = Math.max(rowIndex - 1, 0); row <= rowLimit; row++) {
            for (let col = Math.max(colIndex - 1, 0); col <= colLimit; col++) {
                console.debug(`[DEBUG] Checking: (${row}, ${col})`)
                if (row < 0 || row >= this.#size || col < 0 || col >= this.#size) {
                    console.debug(`[DEBUG] Cell is invalid`)
                    continue
                }

                if (this.#cells[row][col].hasMine()) {
                    minesInNeighboringCells++
                }
            }
        }
        this.#cells[rowIndex][colIndex].activate(minesInNeighboringCells)
        this.#activeCells++

        // If the cell has no mines around it, activate the neighboring cells as well
        if (minesInNeighboringCells === 0) {
            console.debug(`[DEBUG] No mines were found nearby.`)
            console.debug(`[DEBUG] Safe cells will be activated automatically`)
            for (let row = Math.max(rowIndex - 1, 0); row <= rowLimit; row++) {
                for (let col = Math.max(colIndex - 1, 0); col <= colLimit; col++) {
                    if (row < 0 || row >= this.#size || col < 0 || col >= this.#size) {
                        console.debug(`[DEBUG] Cell is invalid`)
                        continue
                    }
    
                    if (row !== rowIndex || col !== colIndex) {
                        console.debug(`[DEBUG] Activating: (${row}, ${col})`)
                        this.activateCell(row, col)
                    }
                }
            }
        }

        if (this.#activeCells === this.#size * this.#size - this.#totalMines) {
            this.#gameWon = true
        }

        return true
    }
}