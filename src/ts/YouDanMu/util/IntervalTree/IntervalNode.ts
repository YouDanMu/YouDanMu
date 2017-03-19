export enum IntervalNodeColor {
    RED,
    BLACK
}

export enum IntervalNodeDirection {
    NONE,
    LEFT,
    RIGHT
}

export class IntervalNode<V> {
    start: number;
    end: number;
    max: number;

    parent: IntervalNode<V>;
    left: IntervalNode<V>;
    right: IntervalNode<V>;

    color: IntervalNodeColor;
    values: V[];

    /**
     * Indicates wheter the node has a parent.
     *
     * @readonly
     * @type {boolean}
     * @memberOf IntervalNode
     */
    get isRoot(): boolean {
        return !this.parent;
    }

    /**
     * Indicates wheter the node has children.
     *
     * @readonly
     * @type {boolean}
     * @memberOf IntervalNode
     */
    get isLeaf(): boolean {
        return !(this.left || this.right);
    }

    /**
     * The direction of the parent, from the child point-of-view.
     *
     * @readonly
     * @type {IntervalNodeDirection}
     * @memberOf IntervalNode
     */
    get parentDirection(): IntervalNodeDirection {
        if (this.parent) {
            if (this.parent.left === this) {
                return IntervalNodeDirection.RIGHT;
            } else {
                return IntervalNodeDirection.LEFT;
            }
        } else {
            return IntervalNodeDirection.NONE;
        }
    }

    /**
     * Return left most node of its right sub-tree, or null.
     *
     * @readonly
     * @type {IntervalNode<V>}
     * @memberOf IntervalNode
     */
    get successor(): IntervalNode<V> {
        if (!this.right) {
            return null;
        }
        let node = this.right;
        while (node.left) {
            node = node.left;
        }
        return node;
    }

    /**
     * Return parent of parent or null.
     *
     * @readonly
     * @type {IntervalNode<V>}
     * @memberOf IntervalNode
     */
    get grandParent(): IntervalNode<V> {
        if (this.parent) {
            return this.parent.parent;
        }
        return null;
    }

    /**
     * Return sibling node, or null.
     *
     * @readonly
     * @type {IntervalNode<V>}
     * @memberOf IntervalNode
     */
    get sibling(): IntervalNode<V> {
        if (this.parent) {
            if (this.parent.right === this) {
                return this.parent.left;
            }
            return this.parent.right;
        }
        return null;
    }

    /**
     * Return sibling of partent node, or null.
     *
     * @readonly
     * @type {IntervalNode<V>}
     * @memberOf IntervalNode
     */
    get uncle(): IntervalNode<V> {
        if (this.parent) {
            return this.parent.sibling;
        }
        return null;
    }

    constructor(start: number, end: number, values: V[] | V) {
        this.start = start;
        this.end = end;
        this.max = end;
        this.values = [].concat(values);
    }

    compareTo(i: IntervalNode<V>): -1 | 0 | 1 {
        return this.compareInterval(i.start, i.end);
    }

    compareInterval(start: number, end: number): -1 | 0 | 1 {
        if (this.start < start) {
            return -1;
        } else if (this.start > start) {
            return 1;
        } else if (this.end < end) {
            return -1;
        } else if (this.end > end) {
            return 1;
        }
        return 0;
    }

    /**
     * Test if the interval node overlaps a given interval.
     *
     * @param {number} start
     * @param {number} end
     * @returns
     *
     * @memberOf IntervalNode
     */
    overlaps(start: number, end: number) {
        return this.start <= end && this.end >= start;
    }

    /**
     * Test if the interval node contains a given point.
     *
     * @param {number} point
     * @returns
     *
     * @memberOf IntervalNode
     */
    contains(point: number) {
        return this.start <= point && this.end >= point;
    }

    merge(i: IntervalNode<V>) {
        this.values.splice(this.values.length, 0, ...i.values);
    }

    /**
     * Swap interval and values with another node.
     * But leave their positions in place.
     * 
     * @param {IntervalNode<V>} i 
     * 
     * @memberOf IntervalNode
     */
    swap(i: IntervalNode<V>) {
        const { start, end, values } = i;
        i.start = this.start;
        i.end = this.end;
        i.values = this.values;
        this.start = start;
        this.end = end;
        this.values = values;
    }

    updateMax(): void {
        this.max = this.end;
        if (this.right && this.right.max > this.max) {
            this.max = this.right.max;
        }
        if (this.left && this.left.max > this.max) {
            this.max = this.left.max;
        }
        if (this.parent) {
            this.parent.updateMax();
        }
    }

    toString(): string {
        return `<${this.start}, (${this.values.length}), ${this.end}>`;
    }
}
