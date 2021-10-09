import {COLUMNS, DEFAULT_HP, ROWS} from "../../../constants/constants";
import {Card} from "./card"

export class GameState {
    get collection() {
        return this._collection;
    }

    set collection(value) {
        this._collection = value;
    }

    get self() {
        return this._self;
    }

    set self(value) {
        this._self = value;
    }

    get opp() {
        return this._opp;
    }

    set opp(value) {
        this._opp = value;
    }

    get firstPlayer() {
        return this._firstPlayer;
    }

    set firstPlayer(value) {
        this._firstPlayer = value;
    }

    get hasTurn() {
        return this._hasTurn;
    }

    set hasTurn(value) {
        this._hasTurn = value;
    }

    get deck() {
        return this._deck;
    }

    set deck(value) {
        this._deck = value;
    }

    get hand() {
        return this._hand;
    }

    set hand(value) {
        this._hand = value;
    }

    get hp() {
        return this._hp;
    }

    set hp(value) {
        this._hp = value;
    }

    get cash() {
        return this._cash;
    }

    set cash(value) {
        this._cash = value;
    }

    get handCount() {
        return this._handCount;
    }

    set handCount(value) {
        this._handCount = value;
    }

    get turnCount() {
        return this._turnCount;
    }

    set turnCount(value) {
        this._turnCount = value;
    }

    get field() {
        return this._field;
    }

    set field(value) {
        this._field = value;
    }

    /**
     * Default loader for initialization of the game.
     * @param {Object<String>} collection The collection of cards that are read from in order to handle actions in the game.
     * @param {String} self The ID of the user running the program this state was initialized in.
     * @param {String} opp The ID of the user's opponent.
     * @param {String} firstPlayer A randomly chosen ID, representing the ID of the player that goes first.
     * @param {Card[]} deck The cards in the user's deck, cloned from the collection.
     */
    init(collection, self, opp, firstPlayer, deck) {
        this._collection = collection;
        this._self = self;
        this._opp = opp;
        this._firstPlayer = firstPlayer;
        this._deck = deck;
        this._hasTurn = false; // Set to false for now, will be initialized when the turn gets passed to one of the two players via the Database
        this._hand = [];
        this._hp = {
            [self]: DEFAULT_HP,
            [opp]: DEFAULT_HP
        };
        this._cash = {
            [self]: 0,
            [opp]: 0
        };
        this._turnCount = {
            [self]: 0,
            [opp]: 0
        };
        this._field = Array.from(Array(COLUMNS), () => new Array(ROWS));

        for (let i = 0; i < 2; i++) {
            this.drawCard(self);
            this.drawCard(opp);
        }
    }

    /**
     * The logic for when a user requests to draw a card.
     * @param {String} user said user
     */
    drawCard(user) {
        if (user === this.self) { // Updates your own deck if the user drawing the card is you.
            if (this.deck.length !== 0 && this.hand.length <= 8) {
                const topDeck = this.deck.shift();
                this.hand.push(topDeck.clone());
            }
        }
    }

    /**
     * The logic for when a turn gets passed to a specific user
     * @param {String} user said user
     */
    handOverTurn(user) {
        // Card draw, cash handling and turn count incrementing.
        this.drawCard(user);
        this.hasTurn = (user === this.self);
        this.turnCount[user]++;
        this.cash[user] = this.turnCount[user] + 2;
    }
}