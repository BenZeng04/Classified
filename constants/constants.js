export const DEFAULT_HP = 50;
export const DECK_CAPACITY = 8;
export const COLUMNS = 5, ROWS = 6;
export const gameStart = 0;
export const switchTurn = 1;
export const cardPlaced = 2;
export const cardMoved = 3;
export const cardAttacked = 4;


/*

Idea for attacks:

calculateCardStats = {
    initialAttack: whatever
    initialMovement... etc
}
damageTakenQuery or preAttackQuery = {
    rawDamage: something that gets modified
    attacker: the card that is attacking, null if it is a spell
    attacked: the card that is being attacked OR the playerID being attacked
    attackedIsPlayer: if the attacked is one of the players
}
animation = {
    preventsInput: true,
    duration: 600 (ms)
    handle: function(duration) {
    }
}

Events get passed as pointers and can have their attributes be modified before the final decision is made
 */