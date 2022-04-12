/**
 * Wrapper class for actions like attacking and moving to generify code structure
 */
import {CARD_ACTIONS, ROWS} from "../../constants/constants";

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
                for (let direction = -1; direction <= 1; direction += 2) {
                    for (let dist = 1; dist <= card.range; dist++) {
                        const currRow = card.row + dist * direction;
                        if (currRow < 0 || currRow >= ROWS) break;
                        if (game.field[card.col][currRow] && game.field[card.col][currRow].user !== card.user) {
                            locations.push({col: card.col, row: currRow});
                            break;
                        }
                    }
                }
                return locations;
            }, (card, col, row) => {
                const game = card.game;
                game.field[col][row].takeDamage(card);
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
                console.log(locations)
                return locations;
            }, (card, col, row) => {
                card.relocate(col, row);
                card.onMove();
            },
            1)
    }
}