import {db} from "../firebase/firebase";
import {initGame, drawCard, handOverTurn} from "./gameplayHelper";
import {COLUMNS, gameStart, ROWS, switchTurn} from "../../constants/constants"

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

async function reload(data) {
    const actions = data.actionQueue;

    let started = false;
    while (actions.hasOwnProperty(queueProcessIndex)) {
        const action = actions[queueProcessIndex];
        if (action.type === gameStart) {
            await initGameStart(data);
            started = true;
        }

        await processAction(action);
        queueProcessIndex++;
    }
    return started;
}

/**
 * Updates local game variables based on the most recent action dispatched to the action queue.
 * It is assumed that the order that this function is called will be the order that the actions occurred in real time.
 * @param action the action
 * @returns {Promise<void>}
 */
async function processAction(action) {
    switch (action.type) {
        case switchTurn: {
            handOverTurn(action.user);
            break;
        }
    }
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
    const started = await reload(docRef.data());

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