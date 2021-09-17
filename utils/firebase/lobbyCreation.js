/*
Match Creation -
Step 1: Get the player to fill out the form.
Step 2: Check if the current player is in a game. If they are, then send an error.
Step 3: Create the game, put the current player in it, and then redirect them to the gameplay page.

Gameplay Page -
Step 1: Check if the current player is in a game. If they aren't, then send them back to the join page.
Step 2: Render the gameplay page.

Match Joining -
Step 1: Get the player to fill out the form.
Step 2: Check if the current player is in a game. If they are, then send an error.
Step 3: Add the player to the game.
 */

import {db} from "./firebase";
import {gameStart, switchTurn} from "./constants";

/**
 * Creates a fresh new lobby.
 * @returns {Promise<string>}, the ID of the lobby.
 */
export async function createLobby(matchName) {
    const lobby = await db.collection("games").add({
        matchName: matchName,
        currentPlayers: {},
        actionQueue: {},
        currentPlayerCount: 0
    });
    return lobby.id;
}

/**
 * Adds a player to a lobby, checking if said lobby is a valid lobby.
 * @param lobbyID
 * @returns {Promise<{success: boolean, message: string}>} depending on if the lobby is valid.
 */

export async function startGame(lobbyID) {
    const reference = db.collection("games").doc(lobbyID);
    const lobby = await reference.get();
    const keys = Object.keys(lobby.data().currentPlayers);
    const firstPlayer = keys[Math.floor(Math.random() * keys.length)];
    await reference.update({
        firstPlayer: firstPlayer,
        [`actionQueue.0`]: {
            type: gameStart
        },
    })
}


export async function addPlayerToLobby(lobbyID, userID) {
    const reference = db.collection("games").doc(lobbyID);
    const lobby = await reference.get();
    if (!lobby.exists) return {
        success: false,
        message: "Invalid Lobby ID!"
    };
    var gameInit = false;
    if (!lobby.data().currentPlayers.hasOwnProperty(userID)) {
        if (lobby.data().currentPlayerCount === 1) {
            gameInit = true;
        }
        if (lobby.data().currentPlayerCount >= 2) {
            return {
                success: false,
                message: "The Lobby you tried to join is full!"
            };
        }
        await reference.update({
            currentPlayerCount: lobby.data().currentPlayerCount + 1
        });
        await reference.update({
            [`currentPlayers.${userID}`]: {
            }
        });
    }
    await db.collection("users").doc(userID).update({currentMatchID: lobbyID});
    if (gameInit) {
        await startGame(lobbyID);
    }
    return {
        success: true,
        message: "Success."
    };
}
