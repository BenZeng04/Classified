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
    cardMoved: 3,
    cardAttacked: 4,
}

export const CLICK_STATES = {
    noClick: 0,
    cardDragged: 1,
    cardSelected: 2
}
