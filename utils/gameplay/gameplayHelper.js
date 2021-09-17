import {clone, game} from "./gameplay"
import {DEFAULT_HP} from "../../constants/constants";
/*
Raw, User-Decisive Actions (that get pushed to database)

 */
export function shuffle(arr) {
    return arr
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

/**
 * The logic for when a turn gets passed to a specific user
 * @param user said user
 */
export function handOverTurn(user) {
    // Card draw, cash handling and turn count incrementing.
    drawCard(user);
    game.hasTurn = (user === game.self);
    game.turnCount[user]++;
    game.cash[user] = game.turnCount[user] + 2;
}

/**
 * The logic for when a user requests to draw a card.
 * @param user said user
 */
export function drawCard(user) {
    if (user === game.self) { // Updates your own deck if the user drawing the card is you.
        if (game.deck.length !== 0 && game.hand.length <= 8) {
            const topDeck = game.deck.shift();
            game.hand.push(clone(topDeck));
        }
    }
    game.handCount[user]++; // Updates the display for the number of cards regardless.
}

/**
 * Initializes all game variables after the initial database load and flags the state of the game as started, allowing the
 * p5 Sketch to draw.
 */
export function initGame() {
    const self = game.self;
    const opp = game.opp;
    game.hp = {
        [self]: DEFAULT_HP,
        [opp]: DEFAULT_HP
    }

    game.cash = {
        [self]: 0,
        [opp]: 0
    }

    game.handCount = {
        [self]: 0,
        [opp]: 0
    }

    game.turnCount = {
        [self]: 0,
        [opp]: 0
    }

    // Draws 2 cards at start of game
    drawCard(game.self);
    drawCard(game.self);
    drawCard(game.opp);
    drawCard(game.opp);
    handOverTurn(game.firstPlayer);

    game.started = true;
}
