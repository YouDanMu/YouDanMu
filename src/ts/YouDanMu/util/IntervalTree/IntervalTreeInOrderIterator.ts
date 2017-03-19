import {
    IntervalNode as Node
} from './IntervalNode';

import {
    IntervalTreeSuccessorIterator as SuccessorIterator
} from './IntervalTreeSuccessorIterator';

export class IntervalTreeInOrderIterator<V> extends SuccessorIterator<V> {
    constructor(root: Node<V>) {
        if (root) {
            while (root.left) {
                root = root.left;
            }
        }
        super(root);
    }
}