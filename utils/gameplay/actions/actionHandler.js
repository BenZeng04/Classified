import {ACTIONS} from "../../../constants/constants";
import {Queue} from "../../queue"
import {Renderer, ClassifiedRenderer} from "../graphics/renderer";
import {width, height} from "../graphics/renderer";
import {Animation, SpontaneousEvent} from "../graphics/animation";

const maxToHandle = 7500;
// TODO: Figure out a way to actually append the new graphic methods to p5 rather than having a separate wrapper class
export class ActionHandler {

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
    constructor(game) {
        this._game = game;
        this._eventQueue = new Queue(maxToHandle);
        this._currentEvent = null;
    }

    /**
     * Renders one frame of animation, according to the actions dispatched within the Event Queue.
     * @param p5
     */
    render(p5) {
        if (this.currentEvent == null && !this.eventQueue.isEmpty()) {
            this.currentEvent = this.eventQueue.poll();
        }
        if (this.currentEvent != null) {
            const resolved = this.currentEvent.handle(p5);
            if (resolved) this.currentEvent = null;
        }
    }
    processAction(action, preload = false) {
        switch (action.type) {
            case ACTIONS.switchTurn: {
                const onComplete = () => {
                    this.game.handOverTurn(action.user)
                }
                const event = 0 ? new SpontaneousEvent(onComplete) : Animation.createAnimation(action, this.game, onComplete);
                this.pushEvent(event);
                break;
            }
        }
    }
}
