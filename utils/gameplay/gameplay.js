import {db} from "../firebase/firebase";
import {initGame, drawCard, handOverTurn} from "./gameplayHelper";
import {COLUMNS, gameStart, ROWS, switchTurn} from "../../constants/constants"
import {processAction} from "../actions/animation";

/**
 * Terminology
 *
 * ACTION: an event that directly modifies the game state and can be replicable using only the information
 * stored within such action.
 *
 * REQUEST: A flag after an action that indicates that one of the two users must follow a specific set of inputs before proceeding.
 * Requests will be stored in the database as a type of action and will have a completed and uncompleted state, such that the user can still proceed even if
 * they refresh their client.
 *
 * LOCAL REQUEST: A request that occurs purely on the client and does not require a completion, such as opening the UI for moving, placing cards, etc.
 *
 * Since Actions happen spontaneously without additional input, they are synchronous with the rest of the program.
 *
 * Both types of requests will have onSuccessListeners on the client which trigger an event upon successful completion. In the case that a
 * local request gets cancelled, the request will not be considered a success.
 *
 * Actions, Requests, and Local Requests happen synchronously relative to each other in the client and will only start once the previous "event" has
 * FULLY been resolved. This includes animations, user inputs, and anything else that may temporarily halt the normal gameplay flow.
 *
 * To simplify the first stable release, only local requests will be part of the program.
 */
/**
 * Provides the set of global variables and functions corresponding to specific actions within the game.
 * Updates global variables and the database accordingly.
 */
export var queueProcessIndex = 0;
export var globalAuthInfo = {};

/**
 * An object consisting of strictly gameplay-related variables that are collected from the database.
 * Animation and all other variables that need to be outside of draw() are not here.
 * @type {{firstPlayer: null, deck: *[], hp: {}, started: boolean, collection: {}, opp: null, field: any[][], handCount: {}, name: {}, self: null, turnCount: {}, hasTurn: null, cash: {}, hand: *[]}}
 */
export var game = {
    started: false,
    self: null, // user ID of yourself
    opp: null, // user ID of your opponent
    firstPlayer: null, // determines whether to mirror your field or not (your cards will always be placed at the bottom)
    hasTurn: null, // true if it is your turn, false otherwise

    collection: {}, // the cards in the global collection (key = card ID, value = card data)

    deck: [], // the cards in your deck
    hand: [], // the cards in your hand

    hp: {}, // the HP of both users (key = uid, value = HP)
    cash: {}, // the cash of both users (key = uid, value = cash)
    handCount: {}, // the number of cards in both users' hands (key = uid, value, count)
    turnCount: {}, // Number of times the turn gets passed to a user (key = uid, value = count)

    field: Array.from(Array(COLUMNS), () => new Array(ROWS)) // the cards on the field (key = [column, row], value = card data)
}

/**
 * Clones a JSON-based object.
 * @param obj
 * @returns {any}
 */
export function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

/**
 * Checks over the new data snapshot and updates if there are any unprocessed events in the action queue.
 * Loading events from the queue will never require user input.
 *
 * @param data
 * @param preload Whether or not the action is being preloaded at the beginning of the game; this determines whether an animation should occur.
 * @returns {Promise<boolean>}
 */
async function reload(data, preload = false) {
    const actions = data.actionQueue;

    let started = false;
    while (actions.hasOwnProperty(queueProcessIndex)) {
        const action = actions[queueProcessIndex];
        if (action.type === gameStart) {
            await initGameStart(data);
            started = true;
        }

        await processAction(action, preload);
        queueProcessIndex++;
    }
    return started;
}

/**
 * Initializing all database-dependant variable in the `game` object, at the start of the game.
 * @returns {Promise<void>}
 */
async function initGameStart(data) {
    game.self = globalAuthInfo.authUser.uid;
    game.firstPlayer = data.firstPlayer;
    const deckID = data.currentPlayers[game.self].deck;
    for (let i = 0; i < deckID.length; i++) {
        const cardID = deckID[i];
        game.deck.push(game.collection[cardID]);
    }
    const players = data.currentPlayers;
    for (const player in players) {
        if (player !== game.self) {
            game.opp = player;
        }
    }
    initGame();
}

export async function loadCollection() {
    const collectionRef = await db.collection("games").doc("global-cards").get();
    return collectionRef.data();
}

/**
 * Loads actions from the queue in the database in real-time, right when the page is loaded.
 * If the game has started, the variables required will already have been initialized prior to the setup() call
 * in react-p5's sketch.
 * @param authInfo Authentication info, primarily the match's ID and the user's ID.
 * @param startGame The method that will be called when the game starts, specifically for rendering the processing sketch.
 * @returns {Promise<void>} No information is returned.
 */
export async function load(authInfo, startGame) {
    globalAuthInfo = authInfo;
    game.collection = await loadCollection();
    const docRef = await db.collection("games").doc(authInfo.currentMatchID).get();
    const started = await reload(docRef.data(), true);

    if (started) startGame();

    db.collection("games").doc(authInfo.currentMatchID).onSnapshot(async (updatedData) => {
        if (await reload(updatedData.data())) startGame();
    })
}

/**
 * Updates the database upon an action delivered by the user, calling processAction(). This function should be called
 * by itself whenever any action within the game is completed.
 * @param action
 * @returns {Promise<void>}
 */
export async function pushAction(action) {
    const docRef = db.collection("games").doc(globalAuthInfo.currentMatchID);
    await processAction(action);
    queueProcessIndex++; // Prevents the onSnapshot() listener from calling processAction twice
    await docRef.update({
        [`actionQueue.${queueProcessIndex - 1}`]: action
    });
}