import {switchTurn} from "../../constants/constants";
import {handOverTurn} from "../gameplay/gameplayHelper";
import {Queue} from "../queue"
import {width, height, shadowText} from "../components/field"
import {game} from "../gameplay/gameplay";
const maxToHandle = 7500;

export var currentEvent = null;
export const eventQueue = new Queue(maxToHandle); // We assume this doesn't exceed an absurd capacity

export function handleEvent(p5) {
    //console.log(currentEvent, eventQueue);
    if (currentEvent == null && !eventQueue.isEmpty()) {
        currentEvent = eventQueue.poll();
    }
    if (currentEvent != null) {
        const resolved = currentEvent.handle(p5);
        if (resolved) currentEvent = null;
    }
}

export function spontaneousEvent(event) {
    return {
        hasDuration: false,
        handle: () => {
            event();
            return true;
        }
    }
}

export function Animation(duration, onAnimationEnd, handleAnimation) {
    this.hasDuration = true;
    this.maxDuration = duration;
    this.durationPassed = 0;
    this.onAnimationEnd = onAnimationEnd;
    this.handleAnimation = handleAnimation;
}

Animation.prototype.handle = function(p5) {
    if (this.durationPassed === this.maxDuration) {
        this.onAnimationEnd();
        return true;
    }
    this.handleAnimation(p5, this.durationPassed);
    this.durationPassed++;
    return false;
}

/**
 * Updates local game variables based on the most recent action dispatched to the action queue.
 * It is assumed that the order that this function is called will be the order that the actions occurred in real time.
 * @param action the action
 * @param preload
 * @returns {Promise<void>}
 */
export function processAction(action, preload = false) {
    console.log(action);
    switch (action.type) {
        case switchTurn: {
            const evt = () => {
                handOverTurn(action.user)
            }
            // TODO CHECK FOR IF IT IS ANIMATION; PRELOADING;
            pushEvent(new Animation(80, evt, (p5, duration) => {
                const yourTurn = action.user === game.self;
                const message = yourTurn? "IT'S YOUR TURN!": "OPPONENT'S TURN!"
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
                shadowText(p5, message, 0, 0, 150)
                p5.pop();
            }))
            break;
        }
    }
}

export function pushEvent(event) {
    eventQueue.add(event);
}
