export class TimelineNode<V> {
    key: number;
    value: V;
    next: TimelineNode<V>;
    prev: TimelineNode<V>;

    constructor(key: number, value: V) {
        this.key = key;
        this.value = value;
    }
}

export class Timeline<V> {

    private head: TimelineNode<V>;
    private tail: TimelineNode<V>;

    constructor() {
        this.head = null;
        this.tail = null;
    }

    static createFromNodeArray<V>(array: TimelineNode<V>[]): Timeline<V> {
        let timeline = new Timeline<V>();
        let sortedArray = array.sort((a, b) => a.key - b.key);
        for (let node of sortedArray) {
            timeline.insertNode(node, true);
        }
        return timeline;
    }

    /**
     * Find the first node with key greater or equal to given key.
     * 
     * @param {number} key 
     * @param {boolean} [descent=false] 
     * @returns {TimelineNode<V>} 
     * 
     * @memberOf Timeline
     */
    seek(key: number, descent = false): TimelineNode<V> {
        let node = descent ? this.tail : this.head;
        while (node && node.key >= key) node = node.prev || node;
        while (node && node.key < key) node = node.next;
        return node;
    }

    insert(key: number, value: V, descent = false) {
        const node = new TimelineNode(key, value);
        this.insertNode(node, descent);
    }

    insertNode(node: TimelineNode<V>, descent = false) {
        if (!this.head || !this.tail) {
            this.head = node;
            this.tail = node;
        } else if (descent) {
            let next = this.tail;
            while (next.prev && node.key <= next.prev.key)
                next = next.prev;
            this.insertBefore(node, next);
        } else {
            let prev = this.head;
            while (prev.next && prev.next.key < node.key)
                prev = prev.next;
            this.insertAfter(node, prev);
        }
    }

    /**
     * Insert <node> before <next>.
     * 
     * @param {TimelineNode<V>} node 
     * @param {TimelineNode<V>} next 
     * 
     * @memberOf Timeline
     */
    insertBefore(node: TimelineNode<V>, next: TimelineNode<V>) {
        if (node.prev = next.prev)
            node.prev.next = node;
        node.next = next;
        next.prev = node;
    }

    /**
     * Insert <node> after <prev>.
     * 
     * @param {TimelineNode<V>} node 
     * @param {TimelineNode<V>} prev 
     * 
     * @memberOf Timeline
     */
    insertAfter(node: TimelineNode<V>, prev: TimelineNode<V>) {
        if (node.next = prev.next)
            node.next.prev = node;
        node.prev = prev;
        prev.next = node;
    }

    iterateFrom(key: number): TimelineIterator<V> {
        return new TimelineIterator<V>(this.seek(key));
    }
}

export class TimelineIterator<V> {
    private node: TimelineNode<V>;

    constructor(node: TimelineNode<V>) {
        this.node = node;
    }

    hasNext(): boolean {
        return !!this.node;
    }

    peek(): TimelineNode<V> {
        return this.node;
    }

    next(): TimelineNode<V> {
        const node = this.node;
        if (node) this.node = node.next;
        return node;
    }
}