import {ACTIONS} from "../../constants/constants";
import {Queue} from "../../utils/queue"
import {Animation} from "../graphics/animation";

const maxToHandle = 7500;

/*
A handy stack list for implementations per new action:
- Handle client-side user inputs required to perform and once that is done, call pushAction in GameLoader
        (As well as checks if the action is valid (I.E. Does the user have enough cash to place a card?)) (ClassifiedSketch)
- Handle processing reading the action from database (ActionHandler)
- Handle updating game state from action (GameState)
    - Updates to the game state should ABSOLUTELY NEVER create new server-side actions (I.E. if a card being placed ends up placing another card, that 2nd card's placement should be handled locally and NOT pushed)
- Handle animating the action when received (Animation)
TODO: Server side: handle if performing the action is possible or not using rules
 */

/**
 * Responsible for the processing, creation and rendering of in-game actions / animations.
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
        if (this.eventQueue.isEmpty() && evt.gameModificationPeriod === Animation.BEFORE) {
            evt.modifyGameState(); // Modify immediately if the event queue is empty (Which will almost always be the case unless there is lag on the opponent's side in passing actions to you)
            evt.gameModificationFrame = -1; // Set to a frame that will never be reached
        }
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

    /**
     * Method responsible for updating the gameState accordingly during any form of update to the database (either by you or the opponent) and subsequently
     * creating an animation along with it.
     * @param action The action information
     * @param preload Whether the action is preloaded (already happened and user is refreshing game tab) - this will determine whether to play an animation or not
     */
    processAction(action, preload = false) {
        let modifyGameState;
        switch (action.type) {
            case ACTIONS.gameStart: {
                return; // Default beginning action, has no associated side-effects
            }
            case ACTIONS.switchTurn: {
                modifyGameState = () => this.game.handOverTurn(action.user);
                break;
            }
            case ACTIONS.cardPlaced: {
                modifyGameState = () => this.game.placeCard(action.user, action.handIndex, action.col, action.row);
                break;
            }
            case ACTIONS.cardAction: {
                modifyGameState = () => this.game.cardAction(action.col, action.row, action.targetCol, action.targetRow, action.actionType);
                break;
            }
            default: {
                throw new Error("Unsupported Action.");
            }
        }
        if (preload) modifyGameState();
        else this.pushEvent(Animation.createAnimation(action, this.game, modifyGameState));
    }
}
