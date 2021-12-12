import {ACTIONS, COLUMNS, DEFAULT_HP, ROWS} from "../../../constants/constants";

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
            (card, x, y, fill) => {
            p5.rectMode(p5.CENTER);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.imageMode(p5.CENTER);
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

        p5.displayCardOnField = (card, col, row, user) => {
            // Returns the centre of a card on the field
            const fieldPositionToCoordinate = (col, row) => {
                const offset = gridTileSize / 2.0 + gridWidth / 2.0;
                const x = offset + gridOffset + gridTileSize * col;
                const y = offset + (height - gridTileSize * ROWS) / 2 + gridTileSize * row;
                return {
                    x: x,
                    y: y
                }
            }
            const coordinate = fieldPositionToCoordinate(col, row);
            const colour = card.user === user ? 'rgba(0,0,255,0.6)' : 'rgba(255,0,0,0.6)';
            p5.displayCard(card, coordinate.x, coordinate.y, colour);
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
            p5.shadowText(`${currHP} / ${maxHP}`, midX - defWidth / 2 - iconOffset, midY - 1, 16)

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
        p5.displayCardInHand = (card, index) => {
            const handIndexToCoordinate = (index) => {
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
            const coordinate = handIndexToCoordinate(index);
            p5.displayCard(card, coordinate.x, coordinate.y, 'rgba(115,115,115,0.6)');
        }
        p5.effectiveBorder = () => {
            p5.rectMode(p5.CORNER);
            p5.strokeWeight(5);
            p5.noFill();
            p5.stroke('#FFFFFF');
            p5.rect(0, 0, width, height);
        }
        p5.button = (x, y, xLen, yLen, colour, text) => {
            p5.rectMode(p5.CORNER);
            p5.strokeWeight(5);
            p5.fill(colour);
            p5.stroke('#FFFFFF');

            p5.rect(x, y, xLen, yLen, 10, 10);
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.shadowText(text, x + xLen / 2, y + yLen / 2, 40);
        }
    }
}


export class ClassifiedSketch {

    constructor(game, handler, loader) {
        this.game = game;
        this.handler = handler;
        this.loader = loader;

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
        p5.createCanvas(width, height).parent(canvasParentRef).mouseClicked((a) => this.mouseClicked(a));
        ClassifiedRenderer.attachGraphics(p5);
    }

    draw(p5) {
        p5.textFont(icons.font);
        p5.imageMode(p5.CORNER);
        p5.background(icons.bg);
        p5.smooth();

        p5.gameGrid(127, shadowOffset.normal); // Shadow
        p5.gameGrid(255, 0); // Real Thing

        for (let col = 0; col < COLUMNS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (this.game.field[col][row]) {
                    const c = this.game.field[col][row];
                    p5.displayCardOnField(c, c.col, c.row, this.game.self)
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

        for (let i = 0; i < this.game.hand.length; i++)
            p5.displayCardInHand(this.game.hand[i], i);

        const colour = this.game.hasTurn? 'rgba(171,128,232,0.86)': 'rgba(192,192,192,0.66)';
        const msg = this.game.hasTurn? 'Switch Turn!': "Opponent's Turn!";
        p5.button(handDivider + gridOffset, cardSize * 0.75, width - handDivider - gridOffset * 2, cardSize * 0.75, colour, msg);

        // KEEP THESE AT THE VERY END
        p5.effectiveBorder();
        this.handler.render(p5); // Handles any ongoing game-state related events in the queue on a one-event-per-frame basis
    }

    rectCollision(mx, my, rx, ry, rw, rh) {
        return mx >= rx && mx <= rx + rw && my >= ry && my <= ry + rh;
    }

    mouseClicked(event) {
        if (this.handler.hasPendingEvents()) return;

        if (this.rectCollision(event.offsetX, event.offsetY, handDivider + gridOffset, cardSize * 0.75, width - handDivider - gridOffset * 2, cardSize * 0.75)) {
            this.loader.pushAction({
                type: ACTIONS.switchTurn,
                user: this.game.opp
            });
        }
    }
}