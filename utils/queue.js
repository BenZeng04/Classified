export class Queue {
    constructor(size) {
        this.values = Array(size).fill(0);
        this.l = 0;
        this.r = 0;
    }

    add(val) {
        this.values[this.r++] = val;
    }

    poll() {
        return this.values[this.l++];
    }

    isEmpty() {
        return this.l >= this.r;
    }
}
