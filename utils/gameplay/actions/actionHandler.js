import {ACTIONS} from "../../../constants/constants";
import {Queue} from "../../queue"
import {Animation, SpontaneousEvent} from "../graphics/animation";

const maxToHandle = 7500;

/*
A handy stack list for implementations per new action:
- Handle client-side user inputs required to perform and once that is done, call pushAction in GameLoader
        (As well as checks if the action is valid (I.E. Does the user have enough cash to place a card?)) (ClassifiedSketch)
- Handle processing reading the action from database (ActionHandler)
- Handle updating game state from action (GameState)
- Handle animating the action when received (Animation)
TODO: Server side: handle if performing the action is possible or not using rules
 */

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
        if (this.currentEvent == null && !this.eventQueue.isEmpty()) {
            this.currentEvent = this.eventQueue.poll();
        }
        if (this.currentEvent != null) {
            const resolved = this.currentEvent.handle(p5);
            if (resolved) this.currentEvent = null;
        }
    }

    hasPendingEvents() {
        return !this.eventQueue.isEmpty() || this.currentEvent != null;
    }

    processAction(action, preload = false) {
        switch (action.type) {
            case ACTIONS.switchTurn: {
                this.game.handOverTurn(action.user);
                break;
            }
            case ACTIONS.cardPlaced: {
                this.game.placeCard(action.user, action.handIndex, action.col, action.row);
                break;
            }
        }
        if (!preload) {
            const event = Animation.createAnimation(action, this.game);
            this.pushEvent(event);
        }
    }
}
