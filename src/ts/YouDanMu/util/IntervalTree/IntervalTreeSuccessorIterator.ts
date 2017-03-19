import {
    IntervalNode as Node,
    IntervalNodeDirection as Direction
} from './IntervalNode';
import {
    IntervalTreeIterator as Iterator
} from './IntervalTreeIterator';

export class IntervalTreeSuccessorIterator<V> implements Iterator<V> {
    private _next: Node<V>;

    constructor(node: Node<V>) {
        this._next = node;
    }

    hasNext(): boolean {
        return !!this._next;
    }

    peek(): Node<V> {
        return this._next;
    }

    next(): Node<V> {
        const r = this._next;
        if (!r) {
            return null;
        }
        let next = this._next.successor;
        if (!next) {
            next = this._next;
            while (next.parentDirection === Direction.LEFT) {
                next = next.parent;
            }
            next = next.parent;
        }
        this._next = next;
        return r;
    }
}