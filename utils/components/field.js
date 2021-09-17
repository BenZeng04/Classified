import React from "react";
import {game, load} from "../gameplay/gameplay";
import {COLUMNS, DEFAULT_HP, ROWS} from "../../constants/constants";
const defaultCard = {
    name: null,
    attack: null,
    health: null,
    range: null,
    movement: null,
    cost: null,
    // On Field Properties
    row: null,
    column: null,
    abilityListener: null,
    owner: null,
} // Purely here for referencing and preventing IDE confusion
const width = 2000;
const height = 1100;


/**
 * !important
 * DO NOT USE authInfo.matchData FOR IN-GAME MATCH DATA! IT IS HIGHLY LIKELY TO NOT BE UPDATED.
 *
 */

let bg, hp, atk, mvt, rng;
let font;
function preload(p5) {
    bg = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/886365447056932904/do-alpha.png?width=676&height=473");
    hp = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888436976179609600/HP.png");
    atk = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888436991199416396/ATK.png");
    mvt = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888437015354425354/MVMT.png");
    rng = p5.loadImage("https://media.discordapp.net/attachments/746934121623978186/888437037282263060/RNG.png");
    font = p5.loadFont('https://fontsfree.net//wp-content/fonts/basic/sans-serif/FontsFree-Net-Segoe-UI-Bold.ttf');
}

function setup(p5, canvasParentRef) {
    p5.createCanvas(width, height).parent(canvasParentRef).mouseClicked((a) => mouseClicked(a));

}

function draw(p5) {
    if (!game.started) return;
    p5.textFont(font);
    p5.imageMode(p5.CORNER);
    p5.background(bg);
    p5.smooth();

    const shadowOffset = {
        small: 2,
        normal: 3,
        big: 4
    }

    const gridOffset = 40;
    const gridTileSize = 150;
    const gridWidth = 10;

    const colour = (stroke, fill) => {
        p5.stroke(stroke);
        p5.fill(fill);
    }
    const shadowText = (text, x, yAbsolute, size, boxWidth = null) => {
        p5.noStroke();
        p5.textSize(size);

        const y = yAbsolute - 4; // Adjusting for the text offset
        p5.fill(127);
        if (boxWidth != null) p5.text(text, x + shadowOffset.small, y + shadowOffset.small, boxWidth, boxWidth);
        else p5.text(text, x + shadowOffset.small, y + shadowOffset.small);

        p5.fill(255)
        if (boxWidth != null) p5.text(text, x, y, boxWidth, boxWidth);
        else p5.text(text, x, y);
    }
    const gameGrid = (fill, offset) => {
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
    }
    gameGrid(127, shadowOffset.normal); // Shadow
    gameGrid(255, 0); // Real Thing

    const cardSize = gridTileSize - gridWidth;
    const displayCard = (card, x, y, fill) => {

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
        p5.image(atk, x - (gridTileSize * 3 / 8), y + downOffset, iconSize, iconSize);
        p5.image(hp, x - (gridTileSize / 8), y + downOffset, iconSize, iconSize);
        p5.image(mvt, x + (gridTileSize / 8), y + downOffset, iconSize, iconSize);
        p5.image(rng, x + (gridTileSize * 3 / 8), y + downOffset, iconSize, iconSize);

        shadowText(card.name, x, y - nameOffset, nameSize, cardSize);
        shadowText(`$${card.cost}`, x, y + cardSize / 2 - gridWidth, nameSize)

        shadowText(card.attack, x - (gridTileSize * 3 / 8), y + downOffset, nameSize);
        shadowText(card.health, x - (gridTileSize / 8), y + downOffset, nameSize);
        shadowText(card.movement, x + (gridTileSize / 8), y + downOffset, nameSize);
        shadowText(card.range, x + (gridTileSize * 3 / 8), y + downOffset, nameSize);
    }
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

    const forEachCard = (listener) => {
        for (let col = 0; col < COLUMNS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (game.field[col][row])
                    listener(game.field[col][row]);
            }
        }
    }
    const displayCardOnField = (card, col, row) => {
        const coordinate = fieldPositionToCoordinate(col, row);
        const colour = card.owner === game.self? 'rgba(0,0,255,0.6)': 'rgba(255,0,0,0.6)';
        displayCard(card, coordinate.x, coordinate.y, colour);
    }

    forEachCard((c) => displayCardOnField(c, c.col, c.row));

    const hpBar = (maxHP, currHP, cash, midY, fill, empty, text) => {
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
        p5.image(hp, midX - defWidth / 2 - iconOffset, midY, iconSize, iconSize)

        p5.textAlign(p5.CENTER, p5.CENTER);
        shadowText(`${currHP} / ${maxHP}`, midX - defWidth / 2 - iconOffset, midY - 1, 16)

        p5.rectMode(p5.CENTER);

        // Displaying the player's cash
        p5.strokeWeight(2);
        colour(127, 127);
        p5.rect(midX + defWidth / 2 + iconOffset, midY, iconSize, iconSize, 5);

        colour('#ffeabd', 'rgba(255,211,25,0.7)');
        p5.rect(midX + defWidth / 2 + iconOffset, midY, iconSize, iconSize, 5);

        p5.textAlign(p5.CENTER, p5.CENTER);
        shadowText(`$${cash}`, midX + defWidth / 2 + iconOffset, midY, 26);

        // Displaying additional vanity text
        p5.textAlign(p5.CENTER, p5.CENTER);
        shadowText(text, midX, midY, 28);
    }

    hpBar(DEFAULT_HP, game.hp[game.self], game.cash[game.self],
        gridTileSize * ROWS + (height - gridTileSize * ROWS) * (3 / 4), '#3983c7', '#133759'
    , "You");

    hpBar(DEFAULT_HP, game.hp[game.opp], game.cash[game.opp],
        (height - gridTileSize * ROWS) * (1 / 4), '#e36767', '#772222'
        , "Opponent");
    const effectiveBorder = () => {
        p5.rectMode(p5.CORNER);
        p5.strokeWeight(5);
        p5.noFill();
        p5.stroke('#FFFFFF');
        p5.rect(0, 0, width, height);
    }
    const gridDivider = gridOffset * 2 + gridTileSize * COLUMNS;
    const verticalDivider = (dividerX) => {
        p5.strokeWeight(5);

        p5.stroke(127);
        p5.line(dividerX + shadowOffset.normal, gridOffset + shadowOffset.normal, dividerX + shadowOffset.normal, height - gridOffset + shadowOffset.normal);

        p5.stroke('#ffffff');
        p5.line(dividerX, gridOffset, dividerX, height - gridOffset);
    }

    verticalDivider(gridDivider);
    const cardSeparation = 30;
    const maxCardsPerRow = 4;
    const handDivider = gridDivider +
        (gridOffset * 2 + (maxCardsPerRow - 1) * cardSeparation + maxCardsPerRow * cardSize);

    verticalDivider(handDivider);

    effectiveBorder();

    // Now onto the displaying of the hand

    const handIndexToCoordinate = (index) => {
        const effectiveX = index % maxCardsPerRow;
        const effectiveY = Math.floor(index / maxCardsPerRow);
        const cardCenterOffset = gridTileSize / 2.0 + gridWidth / 2.0;
        // 3/4 is used to center the cards between the 2 dividers.
        const actualX = gridDivider + gridOffset * 3 / 4 + cardCenterOffset + effectiveX * (cardSeparation + cardSize);
        const actualY = cardCenterOffset + (height - gridTileSize * ROWS) / 2 + effectiveY * (cardSeparation + cardSize);
        return {
            x: actualX,
            y: actualY
        }
    }

    // 0-indexed
    const displayCardInHand = (card, index) => {
        const coordinate = handIndexToCoordinate(index);
        displayCard(card, coordinate.x, coordinate.y, 'rgba(115,115,115,0.6)');
    }

    for (let i = 0; i < game.hand.length; i++)
        displayCardInHand(game.hand[i], i);
}

function mouseClicked(event) {
    if (!game.started) return;
    const x = event.offsetX, y = event.offsetY;
}

function keyPressed(event) {
    if (!game.started) return;
}

class Field extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const auth = this.props.authInfo;
        const start = async () => {
            this.props.startGame();
        };
        document.getElementById("sketch").addEventListener('keypress', keyPressed);
        let ignore = load(auth, start);
    }

    render() {
        const Sketch = require("react-p5");
        return <div style={{
            height: '100%',
            width: '100%',
           }} id={"sketch"} tabIndex='8'>
            <Sketch style={{
                transformOrigin: `0 0`,
                transform: `scale(${0.825 * innerWidth / width})`,
            }} preload={preload} setup={setup} draw={draw}/>
        </div>;
    }
}

export default Field;