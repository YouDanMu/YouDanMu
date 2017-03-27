import {
    IntervalNode as Node,
    IntervalNodeColor as Color,
    IntervalNodeDirection as Direction
} from './IntervalNode';

import {
    IntervalTreeSuccessorIterator as SuccessorIterator
} from './IntervalTreeSuccessorIterator';

import {
    IntervalTreeInOrderIterator as InOrderIterator
} from './IntervalTreeInOrderIterator';

export class IntervalTree<V> {
    root: Node<V>;

    searchPoint(
        point: number,
        node = this.root,
        result: Node<V>[] = []
    ): Node<V>[] {
        if (!node) {
            return result;
        }
        if (point > node.max) {
            return result;
        }
        if (node.left) {
            this.searchPoint(point, node.left, result);
        }
        if (node.contains(point)) {
            result.push(node);
        }
        if (point >= node.start && node.right) {
            this.searchPoint(point, node.right, result);
        }
        return result;
    }

    searchInterval(
        start: number,
        end: number,
        node = this.root,
        result: Node<V>[] = []
    ): Node<V>[] {
        if (!node) {
            return result;
        }
        if (node.left) {
            this.searchInterval(start, end, node.left, result);
        }
        if (node.overlaps(start, end)) {
            result.push(node);
        }
        if (node.right && start <= node.max) {
            this.searchInterval(start, end, node.right, result);
        }
        return result;
    }

    findInterval(
        start: number,
        end: number,
        node = this.root
    ): Node<V> {
        while (node) {
            const cmp = node.compareInterval(start, end);
            if (cmp > 0) {
                node = node.left;
            } else if (cmp === 0) {
                return node;
            } else {
                node = node.right;
            }
        }
        return null;
    }

    insert(start: number, end: number, value: V): void {
        const node = new Node(start, end, value);
        this.insertNode(node);
    }

    insertNode(node: Node<V>, parent: Node<V> = this.root): void {
        if (!parent) {
            // root is null
            node.color = Color.BLACK;
            return void (this.root = node);
        }

        // Update max value along the recursive traversal
        if (node.end > parent.max) {
            parent.max = node.end;
        }

        const cmp = node.compareTo(parent);

        if (cmp < 0) {
            if (parent.left) {
                return void this.insertNode(node, parent.left);
            } else {
                node.parent = parent;
                node.color = Color.RED;
                parent.left = node;
            }
        } else if (cmp === 0) {
            return void parent.merge(node);
        } else {
            if (parent.right) {
                return void this.insertNode(node, parent.right)
            } else {
                node.parent = parent;
                node.color = Color.RED;
                parent.right = node;
            }
        }

        node.parent.updateMax();
        this.rebalanceInsert(node);
        this.root.color = Color.BLACK;
    }

    remove(start: number, end: number): void {
        this.removeNode(this.findInterval(start, end));
    }

    removeNode(node: Node<V>): void {
        if (!node) {
            return;
        }
        let temp = node;
        // Reduce the case to at most 1 child under node.
        if (node.left && node.right) {
            // Trick when remove node with both children.
            // Swap it with its successor then delete at leaf.
            temp = node.successor;
            temp.swap(node);
            node.updateMax();
            node = temp;
        }
        // Now node has at most 1 child.
        temp = node.left || node.right;
        if (temp) {
            // Re-attach its only child to its parent.
            temp.parent = node.parent;
        }
        if (node.isRoot) {
            this.root = temp;
        } else {
            if (node.parentDirection === Direction.RIGHT) {
                node.parent.left = temp;
            } else {
                node.parent.right = temp;
            }
            node.parent.updateMax();
        }
        if (node.color === Color.BLACK) {
            // The deletion altered # of BLACK nodes along the path.
            // Then we need to rebalance the RB-tree.
            this.rebalanceRemove(temp || node.parent);
        }
    }

    iterateFrom(start: number): SuccessorIterator<V> {
        let node = this.root;
        let r = node;
        while (node) {
            if (start === node.start) {
                break;
            } else if (start < node.start) {
                if (node.start < r.start) r = node;
                node = node.left;
            } else {
                node = node.right
            }
        }
        return new SuccessorIterator(r);
    }

    iterate(): InOrderIterator<V> {
        return new InOrderIterator(this.root);
    }

    /**
     * Balance by rotate and re-color the RB-tree.
     * 
     * @private
     * @param {Node<V>} node 
     * 
     * @memberOf IntervalTree
     */
    private rebalanceInsert(node: Node<V>): void {
        if (
            !node ||
            !node.parent ||
            node.parent.color === Color.BLACK
        ) {
            return;
        }

        const { uncle } = node;
        if (uncle && uncle.color === Color.RED) {
            node.parent.color = uncle.color = Color.BLACK;
            const gparent = node.grandParent;
            if (gparent && gparent.isRoot) {
                gparent.color = Color.RED;
                this.rebalanceInsert(gparent);
            }
        } else {
            if (
                node.parentDirection === Direction.LEFT &&
                node.parent.parentDirection === Direction.RIGHT
            ) {
                this.rotateLeft(node.parent);
                node = node.left;
            } else if (
                node.parentDirection === Direction.RIGHT &&
                node.parent.parentDirection === Direction.LEFT
            ) {
                this.rotateRight(node.parent);
                node = node.right;
            }

            node.parent.color = Color.BLACK;

            if (node.grandParent) {
                return;
            }

            node.grandParent.color = Color.RED;

            if (node.parentDirection === Direction.RIGHT) {
                this.rotateRight(node.grandParent);
            } else {
                this.rotateLeft(node.grandParent);
            }
        }
    }

    private rebalanceRemove(node: Node<V>): void {
        while (!node.isRoot && node.color === Color.BLACK) {
            if (node.parentDirection === Direction.RIGHT) {
                // Node's parent exists
                // aux could be null though
                let aux = node.parent.right;
                if (aux && aux.color === Color.RED) {
                    aux.color = Color.BLACK;
                    node.parent.color = Color.RED;
                    this.rotateLeft(node.parent);
                    aux = node.parent.right;
                }
                if (
                    aux &&
                    (!aux.left || aux.left.color === Color.BLACK) &&
                    (!aux.right || aux.right.color === Color.BLACK)
                ) {
                    aux.color = Color.RED;
                    node = node.parent;
                } else {
                    if (
                        aux && aux.left &&
                        (!aux.right || aux.right.color === Color.BLACK)
                    ) {
                        aux.left.color = Color.BLACK;
                        aux.color = Color.RED;
                        this.rotateRight(aux);
                        aux = node.parent.right;
                    }

                    aux.color = node.parent.color;
                    node.parent.color = Color.BLACK;
                    aux.right.color = Color.BLACK;
                    this.rotateLeft(node.parent);
                    node = this.root;
                }
            } else {
                let aux = node.parent.left;
                if (aux && aux.color === Color.RED) {
                    aux.color = Color.BLACK;
                    node.parent.color = Color.RED;
                    this.rotateRight(node.parent);
                    aux = node.parent.left;
                }
                if (
                    aux &&
                    (!aux.left || aux.left.color === Color.BLACK) &&
                    (!aux.right || aux.right.color === Color.BLACK)
                ) {
                    aux.color = Color.RED;
                    node = node.parent;
                } else {
                    if (
                        aux && aux.right &&
                        (!aux.left || aux.left.color === Color.BLACK)
                    ) {
                        aux.right.color = Color.BLACK;
                        aux.color = Color.RED;
                        this.rotateLeft(aux);
                        aux = node.parent.left;
                    }

                    aux.color = node.parent.color;
                    node.parent.color = Color.BLACK;
                    aux.left.color = Color.BLACK;
                    this.rotateRight(node.parent);
                    node = this.root;
                }
            }
        }
        node.color = Color.BLACK;
    }

    private rotateLeft(node: Node<V>): void {
        const pivot = node.right;
        if (!pivot) {
            throw new Error('Red-black Tree left rotation expects right child.');
        }
        const dir = node.parentDirection;
        const parent = node.parent; // could be null
        const tempTree = pivot.left; // could be null
        pivot.left = node;
        node.parent = pivot;
        node.right = tempTree;
        if (tempTree) {
            tempTree.parent = node;
        }
        if (dir === Direction.LEFT) {
            parent.right = pivot;
        } else if (dir === Direction.RIGHT) {
            parent.left = pivot;
        } else {
            this.root = pivot;
        }
        pivot.parent = parent;
        node.updateMax();
    }

    private rotateRight(node: Node<V>): void {
        const pivot = node.left;
        if (!pivot) {
            throw new Error('Red-black Tree right rotation expects left child.');
        }
        const dir = node.parentDirection;
        const parent = node.parent; // could be null
        const tempTree = pivot.right; // could be null
        pivot.right = node;
        node.parent = pivot;
        node.left = tempTree;
        if (tempTree) {
            tempTree.parent = node;
        }
        if (dir === Direction.LEFT) {
            parent.right = pivot;
        } else if (dir === Direction.RIGHT) {
            parent.left = pivot;
        } else {
            this.root = pivot;
        }
        pivot.parent = parent;
        node.updateMax();
    }
}
