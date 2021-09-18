

export function Queue(maxSize) {
    this.values = Array(maxSize).fill(0);
    this.l = 0;
    this.r = 0;
}

Queue.prototype.add = function(val) {
    this.values[this.r++] = val;
}

Queue.prototype.poll = function() {
    return this.values[this.l++];
}

Queue.prototype.isEmpty = function() {
    return this.l >= this.r;
}
