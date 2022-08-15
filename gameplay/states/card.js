/**
 * The class representing the base properties for a card represented in its raw database form, prior to being placed on the playfield.
 */
import {Attack, CardAction, Move} from "./cardAction";
import {CARD_ACTIONS} from "../../constants/constants";

export class Card {
    static makeCard(name, description, attack, health, movement, range, cost, id) {
        const dict = new Map([
        ]);
        let cardClass;
        if (dict.has(name)) {
            cardClass = dict.get(name);
        } else {
            cardClass = Card;
        }
        return new(cardClass)(name, description, attack, health, movement, range, cost, id);
        // https://stackoverflow.com/questions/49042459/how-to-instantiate-a-class-from-a-string-in-javascript
    }
    initActions() {
        this.actions = {};
        // TODO: Generify so that different actions are better supported
        this.actions[CARD_ACTIONS.attacking] = new Attack();
        this.actions[CARD_ACTIONS.moving] = new Move();

        // Temporary solution for custom card animations that modify the way cards are normally displayed
        this.display = true;
    }

    /**
     * Do not use the constructor to instantiate cards. Use the static makeCard builder instead.
     * @param name
     * @param description
     * @param attack
     * @param health
     * @param movement
     * @param range
     * @param cost
     * @param id
     */
    constructor(name, description, attack, health, movement, range, cost, id) {
        this._name = name;
        this._description = description;
        this._attack = attack;
        this._health = health;
        this._movement = movement;
        this._range = range;
        this._cost = cost;
        this._id = id;
        this.initActions();
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get attack() {
        return this._attack;
    }

    set attack(value) {
        this._attack = value;
    }

    get health() {
        return this._health;
    }

    set health(value) {
        this._health = value;
        if (this.health <= 0) {
            this.onDeath(this.game);
            this.removeFromGame(this.game);
        }
    }

    get movement() {
        return this._movement;
    }

    set movement(value) {
        this._movement = value;
    }

    get range() {
        return this._range;
    }

    set range(value) {
        this._range = value;
    }

    get cost() {
        return this._cost;
    }

    set cost(value) {
        this._cost = value;
    }

    get user() {
        return this._user;
    }

    set user(value) {
        this._user = value;
    }

    get col() {
        return this._col;
    }

    set col(value) {
        this._col = value;
    }

    get row() {
        return this._row;
    }

    set row(value) {
        this._row = value;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    clone() {
        return Card.makeCard(this.name, this.description, this.attack, this.health, this.movement, this.range, this.cost, this.id);
    }

    place(game, user, col, row) {
        this._user = user;
        this._col = col;
        this._row = row;
        this.game = game;
    }

    onTurnSwitch() {
        for (let action in this.actions) {
            this.actions[action].currActionsLeft = this.actions[action].maxActions;
        }
    }

    onMove() {
        this.actions[CARD_ACTIONS.moving].currActionsLeft--;
        // Cannot move & attack in the same turn.
        this.actions[CARD_ACTIONS.attacking].currActionsLeft = 0;
    }

    onAttack() {
        this.actions[CARD_ACTIONS.attacking].currActionsLeft--;
        // Cannot move & attack in the same turn.
        this.actions[CARD_ACTIONS.moving].currActionsLeft = 0;
    }

    onDeath() {
        // To override / implement
    }

    relocate(col, row) {
        this.game.field[this.col][this.row] = undefined;
        this._col = col;
        this._row = row;
        this.game.field[col][row] = this;
    }

    takeDamage(attacker) {
        this.health -= attacker.attack;
    }

    removeFromGame() {
        this.game.field[this.col][this.row] = undefined;
    }
}

