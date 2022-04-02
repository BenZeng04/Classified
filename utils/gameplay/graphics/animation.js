import {ACTIONS} from "../../../constants/constants";
import {displayRow, fieldPositionToCoordinate, flipField, height, width} from "./classifiedSketch";

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

    constructor(duration, onAnimationEnd, render) {
        super();
        this.maxDuration = duration;
        this.durationPassed = 0;
        this.onAnimationEnd = onAnimationEnd;
        this.render = render;
    }

    static createAnimation(action, game, onCompleteEvent) {
        switch (action.type) {
            case ACTIONS.switchTurn: {
                return new Animation(80, onCompleteEvent, (p5, duration) => {
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
                });
            }
            case ACTIONS.cardPlaced: {
                return new Animation(40, onCompleteEvent, (p5, duration) => {
                    const col = action.col, row = displayRow(action.row, game);
                    const coordinate = fieldPositionToCoordinate(col, row);
                    // TODO: Add card place animation
                });
            }
        }
    }

    handle(p5) {
        if (this.durationPassed === this.maxDuration) {
            this.onAnimationEnd();
            return true;
        }
        this.render(p5, this.durationPassed);
        this.durationPassed++;
        return false;
    }
}
