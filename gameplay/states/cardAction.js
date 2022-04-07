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
    }''
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
        super((field, card) => {
                return undefined; // TODO
            }, (field, card, col, row) => {
                // TODO
            },
            1);
    }
}

export class Move extends CardAction {
    constructor() {
        super((field, card) => {
                let locations = [];
                for (let direction in [1, -1]) {
                    for (let dist = 1; dist <= card.movement; dist++) {
                        const currRow = card.row + dist * direction;
                        if (currRow < 0 || currRow >= ROWS) break;
                        if (field[card.col][currRow]) break;
                        locations.push({col: card.col, row: currRow});
                    }
                }
                return locations;
            }, (field, card, col, row) => {
                field[card.col][card.row] = undefined;
                card.col = col;
                card.row = row;
                field[col][row] = card;
                this.currActionsLeft--;
            },
            1)
    }
}