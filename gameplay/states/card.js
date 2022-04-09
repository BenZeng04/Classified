/**
 * The class representing the base properties for a card represented in its raw database form, prior to being placed on the playfield.
 */
import {Attack, CardAction, Move} from "./cardAction";
import {CARD_ACTIONS} from "../../constants/constants";

export class Card {

    initActions() {
        this.actions = {};
        // TODO: Generify so that different actions are better supported
        this.actions[CARD_ACTIONS.attacking] = new Attack();
        this.actions[CARD_ACTIONS.moving] = new Move();

        // Temporary solution for custom card animations that modify the way cards are normally displayed
        this.display = true;
    }

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
        return new Card(this.name, this.description, this.attack, this.health, this.movement, this.range, this.cost, this.id);
    }

    place(user, col, row) {
        this._user = user;
        this._col = col;
        this._row = row;
    }

    onTurnSwitch() {
        for (let action in this.actions) {
            this.actions[action].currentActions = this.actions[action].maxActions;
        }
    }
}

