const CellIcons = {
    DEFAULT: '',
    UNKNOWN: '\u{2753}',
    FLAGGED: '\u{26A0}',
    SAFE: '',
    TRIPPED_MINE: '\u{1F4A3}',
}

export class Cell {
    #elementId = undefined
    #adjacentMineCount = undefined
    #hasMine = undefined
    #visualIcon = undefined
    #active = undefined
    #minesNearby = undefined
    #isFlaggedDangerous = undefined
    #isFlaggedQuestionable = undefined
    #element = undefined
    #row = undefined
    #col = undefined

    constructor(row, column) {
        this.#elementId = `cell-${row}-${column}`
        this.#row = row
        this.#col = column
        this.#adjacentMineCount = 0
        this.#visualIcon = CellIcons.DEFAULT
        this.#hasMine = false
        this.#active = false
        this.#isFlaggedDangerous = false
        this.#isFlaggedQuestionable = false

        const td = document.createElement('td')
        td.id = this.#elementId
        td.className = 'minefield-cell'
        td.innerHTML = this.#visualIcon
        td.addEventListener('click.tlc.minesweeper', () => {
            if (this.#isFlaggedDangerous || this.#isFlaggedQuestionable) {
                return
            }
            this.#element.dispatchEvent(new CustomEvent('cell-clicked.tlc.minesweeper', {
                bubbles: true,
                detail: {
                    elemId: this.#elementId,
                    elem: this.#element,
                    row: this.#row,
                    col: this.#col,
                }
            }))
        })
        td.addEventListener('right-click.tlc.minesweeper', (event) => {
            if (this.#active) {
                return
            }
            this.toggleFlag()
        })
        this.#element = td
    }

    getElement() {
        return this.#element
    }

    hasMine() {
        return this.#hasMine
    }

    activate() {
        if (this.#active) {
            return
        }
        
        this.#active = true

        if (this.#hasMine) {
            this.#visualIcon = CellIcons.TRIPPED_MINE
            this.#element.dispatchEvent(new CustomEvent('mine-tripped.tlc.minesweeper', {
                bubbles: true,
                detail: {
                    elemId: this.#elementId,
                    elem: this.#element,
                    row: this.#row,
                    col: this.#col,
                }
            }))
        } else if (this.#adjacentMineCount === 0) {
            this.#visualIcon = CellIcons.SAFE
        } else {
            this.#visualIcon = `${this.#adjacentMineCount}`
            this.#element.classList.add(`adjacent-mines-${this.#adjacentMineCount}`)
        }
        this.#element.classList.add('inactive')
        this.#element.innerHTML = this.#visualIcon
    }

    toggleFlag() {
        // Toggle the icon on the cell like so
        //  DANGER -> QUESTIONABLE -> DEFAULT
        if (this.#isFlaggedDangerous) {
            this.#isFlaggedDangerous = false
            this.#isFlaggedQuestionable = true
            this.#visualIcon = CellIcons.UNKNOWN
        } else if (this.#isFlaggedQuestionable) {
            this.#isFlaggedQuestionable = false
            this.#visualIcon = CellIcons.DEFAULT

            this.#element.dispatchEvent(new CustomEvent('flag-unset.tlc.minesweeper', {
                bubbles: true,
            }))
        } else {
            this.#isFlaggedDangerous = true
            this.#visualIcon = CellIcons.FLAGGED
            this.#element.dispatchEvent(new CustomEvent('flag-set.tlc.minesweeper', {
                bubbles: true,
            }))
        }
        this.#element.innerHTML = this.#visualIcon
    }

    incrementAdjacentMineCount() {
        this.#adjacentMineCount++
    }

    isActive() {
        return this.#active
    }

    getIcon() {
        return this.#visualIcon
    }

    toString() {
        return `${this.#hasMine ? 'X' : this.#elementId}`
    }

    getAdjacentMinesCount() {
        return this.#adjacentMineCount
    }

    getElementId() {
        return this.#elementId
    }

    getElementClasses() {
        return 'cell-unknown'
    }

    plantMine() {
        this.#hasMine = true
    }
}