import {ACTIONS, CARD_ACTIONS} from "../../constants/constants";
import {displayRow, fieldPositionToCoordinate, height, width} from "./classifiedSketch";
import {dist} from "./classifiedSketch"
/**
 * A Helper class to handle synchronous events that occur on a per-frame basis.
 */
export class SynchronousEvent {
    constructor() {
        if (this.constructor === SynchronousEvent) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * Processes a single frame, while this event is active.
     * @abstract
     * @param p5
     * @return {boolean} true if the event has been fully process, false otherwise.
     */
    handle(p5) {
        throw new Error("Please implement this method.");
    }
}

export class SpontaneousEvent extends SynchronousEvent {
    constructor(event) {
        super();
        this.event = event;
    }

    handle(p5) {
        this.event();
        return true;
    }
}

export class Animation extends SynchronousEvent {
    static BEFORE = 0;
    static DURING = 1;
    static AFTER = 2;
    /**
     * Default constructor
     * @param {Number} duration duration in frames of the animation
     * @param render what runs per render
     * @param modifyGameState event that occurs before, during, or after render
     * @param gameModificationPeriod whether the event occurs before, during, or after render
     * @param gameModificationFrame the frame at which the event occurs, if it is during render
     */
    constructor(duration, render, modifyGameState, gameModificationPeriod, gameModificationFrame = undefined) {
        super();
        this.maxDuration = duration;
        this.modifyGameState = modifyGameState;
        this.gameModificationPeriod = gameModificationPeriod;
        this.gameModificationFrame = gameModificationFrame;
        if (this.gameModificationPeriod === Animation.AFTER)
            this.gameModificationFrame = duration;
        else if (this.gameModificationPeriod === Animation.BEFORE)
            this.gameModificationFrame = 0;
        this.durationPassed = 0;
        this.render = render; // All frames in the range [0, maxDuration] will be iterated over
    }

    static createAnimation(action, game, modifyGameState) {
        switch (action.type) {
            case ACTIONS.switchTurn: {
                return new Animation(80, (p5, duration) => {
                    const yourTurn = action.user === game.self;
                    const message = yourTurn ? "IT'S YOUR TURN!" : "OPPONENT'S TURN!"
                    // It's [your/your opponent]'s turn!
                    p5.rectMode(p5.CORNER);

                    const scale = (duration * (80 - duration)) / 40 / 40;
                    const alpha = (duration * (80 - duration)) / 15;

                    p5.noStroke();
                    p5.fill(100, alpha);
                    p5.rect(0, 0, width, height)

                    p5.push();
                    p5.rectMode(p5.CENTER);
                    p5.translate(width / 2, height / 2);
                    p5.scale(scale, scale);

                    let colour;
                    if (yourTurn) {
                        colour = 'rgba(59,116,241,0.9)'
                    } else colour = 'rgba(255,80,80,0.9)'

                    const splashCircle = (x, y, size) => {
                        p5.fill('rgba(255,255,255,0.9)');
                        p5.ellipse(x, y, size + 20);
                        p5.fill(colour);
                        p5.ellipse(x, y, size);
                    }
                    splashCircle(-950, 200, 180)
                    splashCircle(-810, -260, 100)
                    splashCircle(700, 330, 220)
                    splashCircle(990, -50, 80)
                    p5.fill('rgba(255,255,255,0.9)');
                    p5.rect(0, 0, 1820, 320, 160);
                    p5.fill(colour);
                    p5.rect(0, 0, 1800, 300, 150);
                    p5.shadowText(message, 0, 0, 150)
                    p5.pop();
                }, modifyGameState, this.AFTER);
            }
            case ACTIONS.cardPlaced: {
                // Animation follows the event of placing the card (as the card won't show up on the field until it is placed)
                // Animation logic creates an aura around where the card is placed, so it being not on the field makes no sense
                return new Animation(40, (p5, duration) => {
                    const col = action.col, row = displayRow(action.row, game);
                    const coordinate = fieldPositionToCoordinate(col, row);

                    const transparency = 240 - duration * 6;
                    p5.fill(255, transparency);
                    p5.stroke(170, transparency);
                    p5.strokeWeight(150);
                    p5.ellipse(coordinate.x, coordinate.y, 220, 220)
                }, modifyGameState, this.BEFORE);
            }
            case ACTIONS.cardAction: {
                switch (parseInt(action.actionType)) {
                    case CARD_ACTIONS.moving: {
                        // Duration of animation depends on distance moved
                        const framesPerTile = 5;
                        const distance = dist(action.col, action.row, action.targetCol, action.targetRow);
                        const time = Math.floor(distance * framesPerTile);
                        return new Animation(time, (p5, duration) => {
                            const card = game.field[action.col][action.row];

                            if (duration === 0) card.display = false;

                            const progress = Math.min(1, duration / time);
                            const newCol = action.col + (action.targetCol - action.col) * progress;
                            const newRow = action.row + (action.targetRow - action.row) * progress;
                            p5.displayCardOnField(card, newCol, displayRow(newRow, game), game.firstPlayer);

                            if (duration === time) card.display = true;
                        }, modifyGameState, this.AFTER)
                    }
                    case CARD_ACTIONS.attacking: {
                        const framesPerTile = 2.5;
                        const distance = dist(action.col, action.row, action.targetCol, action.targetRow);
                        const time = Math.floor(distance * framesPerTile);
                        return new Animation(time + Math.max(time, 40), (p5, duration) => {
                            // Animation where the card "charges" up, and then backs up
                            const card = game.field[action.col][action.row];

                            if (duration === 0) card.display = false;

                            const progress = duration > time? Math.max(0, 2 - duration / time): Math.min(1, duration / time);
                            const newCol = action.col + (action.targetCol - action.col) * progress;
                            const newRow = action.row + (action.targetRow - action.row) * progress;
                            p5.displayCardOnField(card, newCol, displayRow(newRow, game), game.firstPlayer);

                            if (duration > time) {
                                // Display impact of attack
                                const transparency = 240 - (duration - time) * 6;
                                const fieldImpactTransparency = 40 - (duration - time);
                                p5.fill(170, 0, 0, transparency);
                                p5.stroke(255, 0, 0, transparency);
                                p5.strokeWeight(150);

                                const coordinate = fieldPositionToCoordinate(action.targetCol, displayRow(action.targetRow, game));
                                p5.ellipse(coordinate.x, coordinate.y, 220, 220)

                                p5.noStroke();
                                p5.fill(255, 0, 0, fieldImpactTransparency);
                                p5.rectMode(p5.CORNER);
                                p5.rect(0, 0, width, height);
                            }

                            if (duration === time + Math.max(time, 40)) card.display = true;
                        }, modifyGameState, this.DURING, time)
                    }
                }
            }
        }
    }

    handle(p5) {
        this.render(p5, this.durationPassed);
        if (this.durationPassed === this.gameModificationFrame) {
            if (this.modifyGameState != null) this.modifyGameState();
        }
        if (this.durationPassed === this.maxDuration) return true;
        this.durationPassed++;
        return false;
    }
}
