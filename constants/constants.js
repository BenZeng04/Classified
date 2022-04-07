/**
 * All constants used throughout the program.
 * @type {number}
 */
// Gameplay-Specific
export const DEFAULT_HP = 50;
export const DECK_CAPACITY = 8;
export const COLUMNS = 5, ROWS = 6;

// Actions
export const ACTIONS = {
    gameStart: 0,
    switchTurn: 1,
    cardPlaced: 2,
    cardAction: 3
}

export const CLICK_STATES = {
    noClick: 0,
    cardDragged: 1,
    cardSelected: 2
}

export const CARD_ACTIONS = {
    none: 0,
    attacking: 1,
    moving: 2
}

export const CARD_ACTION_BUTTONS = {
    [CARD_ACTIONS.attacking]: {
        fill: 'rgb(220,62,62)',
        stroke: 'rgb(189,31,31)',
        text: 'Attack!'
    },
    [CARD_ACTIONS.moving]: {
        fill: 'rgb(245,153,61)',
        stroke: 'rgb(189,91,21)',
        text: 'Move!'
    }
}