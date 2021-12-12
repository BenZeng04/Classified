import {ACTIONS} from "../../../constants/constants";
import {Queue} from "../../queue"
import {Animation, SpontaneousEvent} from "../graphics/animation";

const maxToHandle = 7500;

// TODO: Figure out a way to actually append the new graphic methods to p5 rather than having a separate wrapper class
export class ActionHandler {

    constructor(game) {
        this._game = game;
        this._eventQueue = new Queue(maxToHandle);
        this._currentEvent = null;
    }

    get game() {
        return this._game;
    }

    set game(value) {
        this._game = value;
    }

    get eventQueue() {
        return this._eventQueue;
    }

    get currentEvent() {
        return this._currentEvent;
    }

    set currentEvent(value) {
        this._currentEvent = value;
    }

    pushEvent(evt) {
        this.eventQueue.add(evt);
    }

    /**
     * Renders one frame of animation, according to the actions dispatched within the Event Queue.
     * @param p5
     */
    render(p5) {
        while (true) {
            if (this.currentEvent == null && !this.eventQueue.isEmpty()) {
                this.currentEvent = this.eventQueue.poll();
            }
            // Loop is so that multiple spontaneous events get handled instantly rather than once-per-frame
            if (this.currentEvent != null) {
                const resolved = this.currentEvent.handle(p5);
                if (resolved) this.currentEvent = null;
                else break;
            } else break;
        }
    }

    hasPendingEvents() {
        return !this.eventQueue.isEmpty() || this.currentEvent != null;
    }

    processAction(action, preload = false) {
        switch (action.type) {
            case ACTIONS.switchTurn: {
                const onComplete = () => {
                    this.game.handOverTurn(action.user)
                }
                const event = preload ? new SpontaneousEvent(onComplete) : Animation.createAnimation(action, this.game, onComplete);
                this.pushEvent(event);
                break;
            }
        }
    }
}
