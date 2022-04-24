/**
 * Wrapper class for actions like attacking and moving to generify code structure
 */
import {CARD_ACTIONS, COLUMNS, ROWS} from "../../constants/constants";
import {displayRow, flipField} from "../graphics/classifiedSketch";

export class CardAction {

    constructor(getTargets, onTargetClick, maxActions) {
        this._getTargets = getTargets;
        this._onTargetClick = onTargetClick;
        this._currActionsLeft = maxActions;
        this._maxActions = maxActions;
    }

    get getTargets() {
        return this._getTargets;
    }

    set getTargets(value) {
        this._getTargets = value;
    }

    get onTargetClick() {
        return this._onTargetClick;
    }

    set onTargetClick(value) {
        this._onTargetClick = value;
    }

    get currActionsLeft() {
        return this._currActionsLeft;
    }

    set currActionsLeft(value) {
        this._currActionsLeft = value;
    }

    get maxActions() {
        return this._maxActions;
    }

    set maxActions(value) {
        this._maxActions = value;
    }
}

export class Attack extends CardAction {

    constructor() {
        super((card) => {
                const game = card.game;
                let locations = [];
                // Both players get to attack the other player when the card has range to attack what _appears to them_ as row index -1
                const playerRow = displayRow(-1, game);
                let lowBound = Math.min(playerRow, 0), highBound = Math.max(playerRow, ROWS - 1);

                for (let direction = -1; direction <= 1; direction += 2) {
                    for (let dist = 1; dist <= card.range; dist++) {
                        const currRow = card.row + dist * direction;
                        if (currRow < lowBound || currRow > highBound) break;
                        if (currRow === playerRow) {
                            locations.push({col: card.col, row: currRow});
                        } else if (game.field[card.col][currRow] && game.field[card.col][currRow].user !== card.user) {
                            locations.push({col: card.col, row: currRow});
                            break;
                        }
                    }
                }
                return locations;
            }, (card, col, row) => {
                const game = card.game;
                if (row < 0 || row >= ROWS) { // Only state where this is possible is if the card is attacking the other player
                    const cardOpponent = card.user === game.self? game.opp: game.self;
                    game.userTakeDamage(cardOpponent, card);
                } else game.field[col][row].takeDamage(card);
                card.onAttack();
            },
            1);
    }
}

export class Move extends CardAction {
    constructor() {
        super((card) => {
            const game = card.game;
                let locations = [];
                for (let direction = -1; direction <= 1; direction += 2) {
                    for (let dist = 1; dist <= card.movement; dist++) {
                        const currRow = card.row + dist * direction;
                        if (currRow < 0 || currRow >= ROWS) break;
                        if (game.field[card.col][currRow]) break;
                        locations.push({col: card.col, row: currRow});
                    }
                }
                return locations;
            }, (card, col, row) => {
                card.relocate(col, row);
                card.onMove();
            },
            1)
    }
}