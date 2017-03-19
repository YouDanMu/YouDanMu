import { IntervalNode } from './IntervalNode';

export interface IntervalTreeIterator<V> {
    hasNext(): boolean;
    peek(): IntervalNode<V>;
    next(): IntervalNode<V>;
}