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
        td.addEventListener('click', () => {
            console.debug(`[DEBUG] Cell Clicked: ${this.#elementId}`)
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
        td.addEventListener('contextmenu', (event) => {
            event.preventDefault()
            if (this.#active) {
                return
            }
            console.debug(`[DEBUG] Context Click: ${this.#elementId}`)
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
        console.debug(`[DEBUG] Activating ${this.#elementId}`, {
            element: this.#element,
            realElement: this.getElementId(this.#elementId),
            this: this,
        })
        if (this.#active) {
            return
        }
        
        this.#active = true
        // this.#element.dispatchEvent(Events.Clicked)
        // this.#element.dispatch('cell-clicked.tlc.minesweeper', {
        //     id: this.#elementId,
        //     col: this.#col,
        //     row: this.#row,
        // })

        if (this.#hasMine) {
            this.#visualIcon = CellIcons.TRIPPED_MINE
            console.debug(`[DEBUG] Cell ${this.#elementId} had a mine`)
            this.#element.dispatchEvent(new CustomEvent('mine-tripped.tlc.minesweeper', {
                bubbles: true,
                detail: {
                    elemId: this.#elementId,
                    elem: this.#element,
                    row: this.#row,
                    col: this.#col,
                }
            }))
            // this.#element.dispatch('mine-tripped.tlc.minesweeper', {
            //     id: this.#elementId,
            //     col: this.#col,
            //     row: this.#row,
            // })
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
        } else {
            this.#isFlaggedDangerous = true
            this.#visualIcon = CellIcons.FLAGGED
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