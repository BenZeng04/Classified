import {db} from "../../firebase/firebase";
import {ACTIONS} from "../../../constants/constants";
import {Card} from "../states/card"
/**
 * Wrapper class that initially loads data from the database and periodically fires events whenever an action occurs.
 * Accepts a parameter for an unloaded GameState instance that it will update by reference.
 */
export class GameLoader {

    queueProcessIndex = 0;
    hasStarted = false;

    get gameState() {
        return this._gameState;
    }
    /**
     *
     * @param {GameState} value
     */
    set gameState(value) {
        this._gameState = value;
    }
    get authInfo() {
        return this._authInfo;
    }

    set authInfo(value) {
        this._authInfo = value;
    }

    onGameStart(value) {
        this._onGameStart = value;
    }

    get gameActionHandler() {
        return this._gameActionHandler;
    }

    set gameActionHandler(value) {
        this._gameActionHandler = value;
    }

    /**
     * @param {Object} authInfo
     * @param {GameState} gameState
     * @param {ActionHandler} gameActionHandler
     */
    constructor(authInfo, gameState, gameActionHandler) {

        this._authInfo = authInfo;
        this._gameState = gameState;
        this._gameActionHandler = gameActionHandler;
    }

    static async loadCollection() {
        const collectionRef = await db.collection("games").doc("global-cards").get();
        const data =  collectionRef.data();
        const collection = {};
        for (const cardID in data) {
            const current = data[cardID];
            collection[cardID] = new Card(
                current.name,
                current.description,
                current.attack,
                current.health,
                current.movement,
                current.range,
                current.cost
            )
        }
        return collection;
    }

    loadAndListen() {
        db.collection("games").doc(this.authInfo.currentMatchID).get().then(async (data) => {
            const collection = await GameLoader.loadCollection();
            this.reload(data.data(), collection,true);
            db.collection("games").doc(this.authInfo.currentMatchID).onSnapshot(async (updatedData) => {
                this.reload(updatedData.data(), collection);
            })
        });
    }

    /**
     * @param {Object} data
     * @param {Object} collection
     * @param {Boolean} preload
     */
    reload(data, collection, preload = false) {
        const actions = data.actionQueue;

        while (actions.hasOwnProperty(this.queueProcessIndex)) {
            const action = actions[this.queueProcessIndex];

            if (action.type === ACTIONS.switchTurn) {
                // The game is considered to have started when the turn has been passed to one of the two players.
                this.start(data, collection);
            }

            // Processes a generic action
            this.gameActionHandler.processAction(action, true);
            // Flags the action as processed
            this.queueProcessIndex++;
        }
    }

    start(data, collection) {
        if (!this.hasStarted) {
            this.hasStarted = true;
            // Parses the data
            const self = this.authInfo.authUser.uid;
            const firstPlayer = data.firstPlayer;
            // Loading card objects from the listed IDs in the deck
            const deckID = data.currentPlayers[self].deck;
            const deck = [];
            for (let i = 0; i < deckID.length; i++) {
                const cardID = deckID[i];
                deck.push(collection[cardID]);
            }
            const players = data.currentPlayers;

            let opp = null;
            for (const player in players) {
                if (player !== self) {
                    opp = player;
                }
            }
            // Initializes GameState
            this.gameState.init(collection, self, opp, firstPlayer, deck);
            // Updates the React State, rendering the elements that depend on the game state
            this._onGameStart();
        }
    }
}