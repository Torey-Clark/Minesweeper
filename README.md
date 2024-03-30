# Minesweeper

Minesweeper is a popular game with the objective of activating all cells in a minefield that do not contain a mine.
This is a simple library for creating games of Minesweeper within a webpage with basic controls and designs.

## Example

The library requires a DOM element in which to contain the game.
Simple pass in the ID of the element to the constructor with any custom options and the game begins.
```
import * from 'index.mjs'

const game = new Minesweeper('minesweeper-game-container', {})
```

## Options

### mineDensity

A floating point number of the range (0, 1) that indicates the percentage of cells that will be mines. \
Default: 0.20

### size

A whole number of the range with a minimum of 5 that indicates the width and height of the minefield. \
Default: 10

## API

### changeSize

Changes the size of the minefield and creates a new game with the new size.

### newGame

Destroys the current game and creates a new minefield.

## Events

### cellClicked

Event: cell-clicked.tlc.minesweeper \
Description: The event triggered everytime a cell, revealed or hidden, is clicked by the player.

### gameLost

Event: game-lost.minesweeper \
Description: The event triggered when the player has lost the game.

### gameWon

Event: game-won.minesweeper \
Description: The event triggered when the player has completed the game.

### mineTripped

Event: mine-tripped.tlc.minesweeper \
Description: The event triggered everytime a cell containing a mine is clicked by the player.
