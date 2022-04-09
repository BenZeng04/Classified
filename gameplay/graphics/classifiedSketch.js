import {
    ACTIONS,
    CARD_ACTION_BUTTONS,
    CARD_ACTIONS,
    CLICK_STATES,
    COLUMNS,
    DEFAULT_HP,
    ROWS
} from "../../constants/constants";

export const width = 2000;
export const height = 1100;
export const shadowOffset = {
    small: 2,
    normal: 3,
    big: 4
}

// Preloaded globally
export let icons = {};

const gridOffset = 40;
const gridTileSize = 150;
const gridWidth = 10;
const gridDividerSeparation = gridOffset * 2 + gridTileSize * COLUMNS;
const cardSize = gridTileSize - gridWidth;

// In Hand
const cardSeparation = 30;
const maxCardsPerRow = 4;
const handDivider = gridDividerSeparation +
    (gridOffset * 2 + (maxCardsPerRow - 1) * cardSeparation + maxCardsPerRow * cardSize);

const actionButtonSize = gridTileSize / 2;

export function flipField(game) {
    return game.self !== game.firstPlayer;
}

/**
 * Returns the effective row given whether or not the user's field is mirrored (Player 1 vs. Player 2)
 * @param row
 * @param game
 * @returns {number|*}
 */
export function displayRow(row, game) {
    return flipField(game) ? ROWS - 1 - row : row;
}

export function fieldPositionToCoordinate(col, row) {
    const offset = gridTileSize / 2.0 + gridWidth / 2.0;
    const x = offset + gridOffset + gridTileSize * col;
    const y = offset + (height - gridTileSize * ROWS) / 2 + gridTileSize * row;
    return {
        x: x,
        y: y
    }
}

export function handIndexToCoordinate(index) {
    const effectiveX = index % maxCardsPerRow;
    const effectiveY = Math.floor(index / maxCardsPerRow);
    const cardCenterOffset = gridTileSize / 2.0 + gridWidth / 2.0;
    // 3/4 is used to center the cards between the 2 dividers.
    const actualX = gridDividerSeparation + gridOffset * 3 / 4 + cardCenterOffset + effectiveX * (cardSeparation + cardSize);
    const actualY = cardCenterOffset + (height - gridTileSize * ROWS) / 2 + effectiveY * (cardSeparation + cardSize);
    return {
        x: actualX,
        y: actualY
    }
}


/**
 * Handles rectangle-point collision based on the CORNER mode for rectangles.
 * @param mx
 * @param my
 * @param rx
 * @param ry
 * @param rw
 * @param rh
 * @returns {boolean}
 */
function rectCollision(mx, my, rx, ry, rw, rh) {
    return mx >= rx && mx <= rx + rw && my >= ry && my <= ry + rh;
}

export function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/**
 * Handles circle-point collision based on the CENTER mode for ellipses.
 * @param mx
 * @param my
 * @param ex
 * @param ey
 * @param radius
 * @returns {boolean}
 */
function circleCollision(mx, my, ex, ey, radius) {
    return dist(mx, my, ex, ey) <= radius;
}

/**
 * Helper class that statically attaches graphical helper methods uniform across gameplay.
 */
export class ClassifiedRenderer {
    /**
     * Attaches a new set of graphical methods to a p5 object.
     * @param p5
     */
    static attachGraphics(p5) {
        p5.colour = (stroke, fill) => {
            p5.stroke(stroke);
            p5.fill(fill);
        };
        p5.shadowText = (text, x, yAbsolute, size, boxWidth = null) => {
            p5.noStroke();
            p5.textSize(size);

            const shadow = size / 16;
            const y = yAbsolute - size / 8; // Adjusting for the text offset
            p5.fill(127);
            if (boxWidth != null) p5.text(text, x + shadow, y + shadow, boxWidth, boxWidth);
            else p5.text(text, x + shadow, y + shadow);

            p5.fill(255)
            if (boxWidth != null) p5.text(text, x, y, boxWidth, boxWidth);
            else p5.text(text, x, y);
        }
        p5.gameGrid = (fill, offset) => {
            const offsetStartX = gridOffset + offset, offsetStartY = (height - gridTileSize * ROWS) / 2 + offset;
            p5.noStroke();
            p5.rectMode(p5.CORNER);
            p5.fill(fill);
            for (let row = 0; row <= ROWS; row++) {
                p5.rect(offsetStartX, offsetStartY + gridTileSize * row, gridTileSize * COLUMNS + gridWidth, gridWidth);
            }
            for (let col = 0; col <= COLUMNS; col++) {
                p5.rect(offsetStartX + gridTileSize * col, offsetStartY, gridWidth, gridTileSize * ROWS + gridWidth);
            }
        };
        p5.displayCard = /**
         *
         * @param {{name:string,attack:number,health:number,movement:number,range:number,cost:number,owner:string,col:number,row:number}} card
         * @param {number} x
         * @param {number} y
         * @param {string} fill
         */
            (card, x, y, fill, highlight = false) => {
                p5.rectMode(p5.CENTER);
                p5.textAlign(p5.CENTER, p5.CENTER);
                p5.imageMode(p5.CENTER);

                if (highlight) {
                    p5.noFill();
                    p5.strokeWeight(33);
                    p5.stroke('rgba(253,197,66,0.67)');
                    p5.rect(x, y, cardSize, cardSize)
                }
                p5.strokeWeight(4);
                p5.stroke(255);

                p5.fill(fill);
                p5.rect(x, y, cardSize, cardSize);

                // Banner for Name
                p5.strokeWeight(3);

                const nameSize = 22;
                const nameOffset = 30;
                const moneyDisplaySize = 50;
                p5.textSize(nameSize);
                const nameHeight = Math.ceil(p5.textWidth(card.name) / cardSize) * nameOffset;

                p5.fill('rgba(255,0,0,0.75)');

                p5.rect(x, y - nameOffset, cardSize, nameHeight);

                // Cost of Card
                p5.strokeWeight(4);
                p5.ellipse(x, y + cardSize / 2 - gridWidth, moneyDisplaySize, moneyDisplaySize);

                const iconSize = 36;
                const bottomOfName = (nameHeight) / 2 - nameOffset;
                const topOfEllipse = cardSize / 2 - gridWidth - moneyDisplaySize / 2;
                const downOffset = (bottomOfName + topOfEllipse) / 2;
                p5.image(icons.atk, x - (gridTileSize * 3 / 8), y + downOffset, iconSize, iconSize);
                p5.image(icons.hp, x - (gridTileSize / 8), y + downOffset, iconSize, iconSize);
                p5.image(icons.mvt, x + (gridTileSize / 8), y + downOffset, iconSize, iconSize);
                p5.image(icons.rng, x + (gridTileSize * 3 / 8), y + downOffset, iconSize, iconSize);

                p5.shadowText(card.name, x, y - nameOffset, nameSize, cardSize);
                p5.shadowText(`$${card.cost}`, x, y + cardSize / 2 - gridWidth, nameSize)

                p5.shadowText(card.attack, x - (gridTileSize * 3 / 8), y + downOffset, nameSize);
                p5.shadowText(card.health, x - (gridTileSize / 8), y + downOffset, nameSize);
                p5.shadowText(card.movement, x + (gridTileSize / 8), y + downOffset, nameSize);
                p5.shadowText(card.range, x + (gridTileSize * 3 / 8), y + downOffset, nameSize);
        }
        /**
         * Actions => Moving, Attacking
         * @param {Card}card
         */
        p5.displayCardActions = (card) => {
            // (x, y, xLen, yLen, curvature, colour, border, text, textSize)
            const offsetY = (height - gridTileSize * ROWS) / 2 + gridTileSize * (ROWS - 1);
            const midLen = handDivider - gridDividerSeparation;
            const actionCount = Object.keys(card.actions).length;
            const actionButtonLength = (midLen - gridOffset * (actionCount + 1)) / actionCount;

            let count = 0;
            for (let id in card.actions) {
                const action = card.actions[id];
                const buttonGraphics = CARD_ACTION_BUTTONS[id];
                let fill = buttonGraphics.fill, stroke = buttonGraphics.stroke;
                if (action.currActionsLeft === 0) {
                    fill = 'rgb(150,150,150)';
                    stroke = 'rgb(70,70,70)';
                }

                p5.button(gridDividerSeparation + gridOffset * (count + 1) + actionButtonLength * count, offsetY, actionButtonLength, actionButtonSize, 0, fill, stroke, buttonGraphics.text, actionButtonSize / 3)
                count++;
            }
        }
        p5.displayTarget = (col, row, fill) => {
            p5.noFill();
            p5.strokeWeight(15);
            p5.stroke('rgba(100,100,100,190)');
            p5.ellipseMode(p5.CENTER);
            const coordinate = fieldPositionToCoordinate(col, row);
            p5.ellipse(coordinate.x + shadowOffset.normal, coordinate.y + shadowOffset.normal, gridTileSize * 4 / 5, gridTileSize * 4 / 5);
            p5.stroke(fill);
            p5.ellipse(coordinate.x, coordinate.y, gridTileSize * 4 / 5, gridTileSize * 4 / 5);
        }
        p5.displayCardOnField = (card, col, row, user, highlight = false) => {
            // Returns the centre of a card on the field
            const coordinate = fieldPositionToCoordinate(col, row);
            const colour = card.user === user ? 'rgba(0,0,255,0.6)' : 'rgba(255,0,0,0.6)';
            p5.displayCard(card, coordinate.x, coordinate.y, colour, highlight);
        }
        p5.hpBar = (maxHP, currHP, cash, midY, fill, empty, text) => {
            const iconSize = 60;
            p5.rectMode(p5.CENTER);
            const midX = gridOffset + (gridTileSize * COLUMNS) / 2;
            const defWidth = gridTileSize * 3;
            const defHeight = (height - gridTileSize * ROWS) / 4;

            // Displaying the HP Bar itself
            p5.noStroke();
            p5.fill(fill);
            p5.rect(midX, midY, defWidth, defHeight);

            p5.fill(empty);
            const coverWidth = defWidth * currHP / maxHP;
            p5.rect(midX + (coverWidth) / 2, midY, defWidth - coverWidth, defHeight)

            p5.strokeWeight(4);
            p5.stroke(255);
            p5.noFill();
            p5.rect(midX, midY, defWidth, defHeight);

            // Displaying the Heart Icon
            const iconOffset = (iconSize / 2 + 5);
            p5.imageMode(p5.CENTER);
            p5.image(icons.hp, midX - defWidth / 2 - iconOffset, midY, iconSize, iconSize)

            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.shadowText(`${currHP}`, midX - defWidth / 2 - iconOffset, midY - 3, 22)

            p5.rectMode(p5.CENTER);

            // Displaying the player's cash
            p5.strokeWeight(2);
            p5.colour(127, 127);
            p5.rect(midX + defWidth / 2 + iconOffset, midY, iconSize, iconSize, 5);

            p5.colour('#ffeabd', 'rgba(255,211,25,0.7)');
            p5.rect(midX + defWidth / 2 + iconOffset, midY, iconSize, iconSize, 5);

            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.shadowText(`$${cash}`, midX + defWidth / 2 + iconOffset, midY, 26);

            // Displaying additional vanity text
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.shadowText(text, midX, midY, 28);
        };
        p5.verticalDivider = (dividerX) => {
            p5.strokeWeight(5);

            p5.stroke(127);
            p5.line(dividerX + shadowOffset.normal, gridOffset + shadowOffset.normal, dividerX + shadowOffset.normal, height - gridOffset + shadowOffset.normal);

            p5.stroke('#ffffff');
            p5.line(dividerX, gridOffset, dividerX, height - gridOffset);
        }
        p5.displayCardInHand = (card, index, cash) => {
            const coordinate = handIndexToCoordinate(index);
            const fill = card.cost > cash ? 'rgba(47,46,46,0.72)' : 'rgba(115,115,115,0.6)'; // Display cards too expensive differently
            p5.displayCard(card, coordinate.x, coordinate.y, fill);
        }
        p5.displayDraggingCard = (card, index, offsetX, offsetY) => {
            const coordinate = handIndexToCoordinate(index);
            p5.displayCard(card, coordinate.x + offsetX, coordinate.y + offsetY, 'rgba(115,115,115,0.6)', true);
        }
        p5.effectiveBorder = () => {
            p5.rectMode(p5.CORNER);
            p5.strokeWeight(5);
            p5.noFill();
            p5.stroke('#FFFFFF');
            p5.rect(0, 0, width, height);
        }
        p5.cardPlacementHighlightZone = (clickState, globalAnimTimer) => {
            let cardPlaceAreaHighlightTone = 142;
            if (clickState === CLICK_STATES.cardDragged) {
                cardPlaceAreaHighlightTone = (Math.sin(Math.PI * globalAnimTimer / 60.0) + 1) * 90;
            }
            p5.noStroke();
            p5.fill(106, 103, 182, cardPlaceAreaHighlightTone)
            p5.rectMode(p5.CORNER);

            const topLeftCorner = fieldPositionToCoordinate(0, ROWS - 1);
            p5.rect(topLeftCorner.x - gridTileSize / 2.0, topLeftCorner.y - gridTileSize / 2.0, gridTileSize * COLUMNS, gridTileSize)
        }
        // Corner mode button
        p5.button = (x, y, xLen, yLen, curvature, colour, border, text, textSize) => {
            p5.rectMode(p5.CORNER);
            p5.strokeWeight(5);
            p5.fill(colour);
            p5.stroke(border);

            p5.rect(x, y, xLen, yLen, curvature, curvature);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.shadowText(text, x + xLen / 2, y + yLen / 2, textSize);
        }
    }
}

/**
 * Highest level class for all graphical user interface strictly related to gameplay.
 */
export class ClassifiedSketch {

    constructor(game, handler, loader) {
        this.game = game;
        this.globalAnimTimer = 0; // Global counter for frames, used for global animations not associated with database events
        this.handler = handler;
        this.loader = loader;
        this.clickState = {type: CLICK_STATES.noClick};
        this.mouseLocation = {x: 0, y: 0}
    }

    preload(p5) {
        icons.bg = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/886365447056932904/do-alpha.png?width=676&height=473");
        icons.hp = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888436976179609600/HP.png");
        icons.atk = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888436991199416396/ATK.png");
        icons.mvt = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888437015354425354/MVMT.png");
        icons.rng = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888437037282263060/RNG.png");
        icons.font = p5.loadFont('https://fontsfree.net//wp-content/fonts/basic/sans-serif/FontsFree-Net-Segoe-UI-Bold.ttf');
    }

    setup(p5, canvasParentRef) {
        const cnv = p5.createCanvas(width, height).parent(canvasParentRef);
        cnv.mouseReleased((a) => this.mouseReleased(p5, a));
        cnv.mouseMoved((a) => this.mouseMoved(p5, a));
        ClassifiedRenderer.attachGraphics(p5);
    }

    draw(p5) {
        this.globalAnimTimer++;
        p5.pixelDensity(1);
        p5.textFont(icons.font);
        p5.imageMode(p5.CORNER);
        p5.background(icons.bg);
        p5.smooth();

        p5.cardPlacementHighlightZone(this.clickState.type, this.globalAnimTimer);

        p5.gameGrid(127, shadowOffset.normal); // Shadow
        p5.gameGrid(255, 0); // Real Thing

        for (let col = 0; col < COLUMNS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (this.game.field[col][row]) {
                    // Only display cards not being selected
                    if(!(this.clickState.type === CLICK_STATES.cardSelected && this.clickState.row === row && this.clickState.col === col)) {
                        const c = this.game.field[col][row];
                        if (c.display) p5.displayCardOnField(c, col, displayRow(row, this.game), this.game.firstPlayer)
                    }
                }
            }
        }
        if (this.clickState.type === CLICK_STATES.cardSelected) {
            const c = this.game.field[this.clickState.col][this.clickState.row];
            if (c.display) p5.displayCardOnField(c, this.clickState.col, displayRow(this.clickState.row, this.game), this.game.firstPlayer, true)
            if (c.user === this.game.self) {
                if (this.clickState.action === CARD_ACTIONS.none) p5.displayCardActions(c);
                else {
                    const action = c.actions[this.clickState.action];
                    const targetList = action.getTargets(this.game, c);
                    for (let i = 0; i < targetList.length; i++) {
                        const coordinate = fieldPositionToCoordinate(targetList[i].col, displayRow(targetList[i].row, this.game))
                        let colour = circleCollision(this.mouseLocation.x, this.mouseLocation.y, coordinate.x, coordinate.y, gridTileSize * 2 / 5)? 'rgba(170,170,170,190)': 'rgba(255,255,255,255)';
                        p5.displayTarget(targetList[i].col, displayRow(targetList[i].row, this.game), colour)
                    }
                }
            }
        }

        p5.hpBar(DEFAULT_HP, this.game.hp[this.game.self], this.game.cash[this.game.self],
            gridTileSize * ROWS + (height - gridTileSize * ROWS) * (3 / 4), '#3983c7', '#133759'
            , "You");
        p5.hpBar(DEFAULT_HP, this.game.hp[this.game.opp], this.game.cash[this.game.opp],
            (height - gridTileSize * ROWS) * (1 / 4), '#e36767', '#772222'
            , "Opponent");
        p5.verticalDivider(gridDividerSeparation);
        p5.verticalDivider(handDivider);

        for (let i = 0; i < this.game.hand[this.game.self].length; i++) {
            // Only display cards not being dragged
            if (!(this.clickState.type === CLICK_STATES.cardDragged && this.clickState.handIndex === i)) {
                p5.displayCardInHand(this.game.hand[this.game.self][i], i, this.game.cash[this.game.self]);
            }
        }
        // Display card being dragged separately at end
        if (this.clickState.type === CLICK_STATES.cardDragged)
            p5.displayDraggingCard(this.game.hand[this.game.self][this.clickState.handIndex], this.clickState.handIndex, this.clickState.offsetX, this.clickState.offsetY)

        const colour = this.game.hasTurn ? 'rgba(171,128,232,0.86)' : 'rgba(192,192,192,0.66)';
        const msg = this.game.hasTurn ? 'Switch Turn!' : "Opponent's Turn!";
        p5.button(handDivider + gridOffset, cardSize * 0.75, width - handDivider - gridOffset * 2, cardSize * 0.75, 10, colour, 'rgb(255, 255, 255)', msg, 40);

        // KEEP THESE AT THE VERY END
        p5.effectiveBorder();
        this.handler.render(p5); // Handles any ongoing game-state related events in the queue on a one-event-per-frame basis
    }

    /**
     * Called whenever the canvas receives a mouseClick event.
     * Please return out of the method whenever activating individual click events to prevent overlapped objects from performing extraneous behaviours.
     * @param event The mouseClick event
     */
    mousePressed(p5, event) {
        if (this.handler.hasPendingEvents()) return;

        if (this.game.hasTurn) {
            switch (this.clickState.type) {
                // Actions that can only be done with a noClick state
                case CLICK_STATES.noClick: {
                    // Switch Turn
                    if (rectCollision(event.offsetX, event.offsetY, handDivider + gridOffset, cardSize * 0.75, width - handDivider - gridOffset * 2, cardSize * 0.75)) {
                        this.loader.pushAction({
                            type: ACTIONS.switchTurn,
                            user: this.game.opp
                        });
                        return;
                    }

                    // Dragging for Card Placement
                    for (let i = 0; i < this.game.hand[this.game.self].length; i++) {
                        const coordinate = handIndexToCoordinate(i);
                        if (rectCollision(event.offsetX, event.offsetY, coordinate.x - cardSize / 2.0, coordinate.y - cardSize / 2.0, cardSize, cardSize)) {
                            this.clickState = {
                                type: CLICK_STATES.cardDragged,
                                handIndex: i,
                                initialX: event.offsetX,
                                initialY: event.offsetY,
                                currX: event.offsetX,
                                currY: event.offsetY,
                                offsetX: 0,
                                offsetY: 0
                            }
                            return;
                        }
                    }

                    // Selecting Card on Field
                    for (let col = 0; col < COLUMNS; col++) {
                        for (let row = 0; row < ROWS; row++) {
                            const fieldCoordinate = fieldPositionToCoordinate(col, displayRow(row, this.game));
                            if (rectCollision(event.offsetX, event.offsetY, fieldCoordinate.x - gridTileSize / 2, fieldCoordinate.y - gridTileSize / 2, gridTileSize, gridTileSize)) {
                                if (this.game.field[col][row]) {
                                    this.clickState = {
                                        type: CLICK_STATES.cardSelected,
                                        action: CARD_ACTIONS.none,
                                        col: col,
                                        row: row
                                    }
                                    return;
                                }
                            }
                        }
                    }
                    break;
                }
                case CLICK_STATES.cardSelected: {
                    const card = this.game.field[this.clickState.col][this.clickState.row];
                    if (card.user === this.game.self) {
                        switch (this.clickState.action) {
                            case CARD_ACTIONS.none: {
                                // In the action menu / GUI - selecting an action to perform
                                const offsetY = (height - gridTileSize * ROWS) / 2 + gridTileSize * (ROWS - 1);
                                const midLen = handDivider - gridDividerSeparation;
                                const actionCount = Object.keys(card.actions).length;
                                const actionButtonLength = (midLen - gridOffset * (actionCount + 1)) / actionCount;

                                let count = 0;
                                for (let id in card.actions) {
                                    if (card.actions[id].currActionsLeft !== 0) {
                                        if (rectCollision(event.offsetX, event.offsetY, gridDividerSeparation + gridOffset * (count + 1) + actionButtonLength * count, offsetY, actionButtonLength, actionButtonSize)) {
                                            this.clickState.action = id;
                                            return;
                                        }
                                    }
                                    count++;
                                }
                                break;
                            }
                            default: {
                                // Selecting an action's target
                                const action = card.actions[this.clickState.action];
                                const targetList = action.getTargets(this.game, card);
                                for (let i = 0; i < targetList.length; i++) {
                                    const coordinate = fieldPositionToCoordinate(targetList[i].col, displayRow(targetList[i].row, this.game))
                                    if (circleCollision(this.mouseLocation.x, this.mouseLocation.y, coordinate.x, coordinate.y, gridTileSize * 2 / 5)) {
                                        this.loader.pushAction({
                                            type: ACTIONS.cardAction,
                                            actionType: this.clickState.action,
                                            col: this.clickState.col,
                                            row: this.clickState.row,
                                            targetCol: targetList[i].col,
                                            targetRow: targetList[i].row
                                        })
                                        this.clickState = {type: CLICK_STATES.noClick};
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Clicking on an empty or invalid part of the field will reset click state
        this.clickState = {type: CLICK_STATES.noClick};
    }

    mouseReleased(p5, event) {
        if (this.handler.hasPendingEvents()) return;

        // Don't allow dropping cards too expensive
        if (this.clickState.type === CLICK_STATES.cardDragged) {
            const coordinate = handIndexToCoordinate(this.clickState.handIndex);
            coordinate.x += this.clickState.offsetX;
            coordinate.y += this.clickState.offsetY;

            // Both players get to place the card on what appears to them as row index 5 (zero-indexed)
            if (this.game.hand[this.game.self][this.clickState.handIndex].cost <= this.game.cash[this.game.self]) {
                const row = ROWS - 1;
                for (let col = 0; col < COLUMNS; col++) {
                    // Don't place on areas that already have a card
                    if (this.game.field[col][displayRow(row, this.game)] == null) {
                        const fieldCoordinate = fieldPositionToCoordinate(col, row);
                        if (rectCollision(coordinate.x, coordinate.y, fieldCoordinate.x - gridTileSize / 2, fieldCoordinate.y - gridTileSize / 2, gridTileSize, gridTileSize)) {
                            this.loader.pushAction({
                                type: ACTIONS.cardPlaced,
                                user: this.game.self,
                                handIndex: this.clickState.handIndex,
                                col: col,
                                row: displayRow(row, this.game)
                            })
                        }
                    }
                }
            }
            this.clickState = {type: CLICK_STATES.noClick};
        }
    }

    mouseMoved(p5, event) {
        this.mouseLocation.x = event.offsetX;
        this.mouseLocation.y = event.offsetY;
        if (this.handler.hasPendingEvents()) return;

        // Cards dragged that you can't purchase are purely vanity
        if (this.clickState.type === CLICK_STATES.cardDragged && this.game.hand[this.game.self][this.clickState.handIndex].cost <= this.game.cash[this.game.self]) {
            this.clickState.currX = event.offsetX;
            this.clickState.currY = event.offsetY;
            this.clickState.offsetX = this.clickState.currX - this.clickState.initialX;
            this.clickState.offsetY = this.clickState.currY - this.clickState.initialY;
        }
    }
}