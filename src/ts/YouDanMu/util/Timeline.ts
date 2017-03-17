export class TimelineNode<V> {
    key: number;
    value: V;
    next: TimelineNode<V>;
    prev: TimelineNode<V>;
    
    constructor(k: number, v: V, n: TimelineNode<V> = null, p: TimelineNode<V> = null) {
        this.key = k;
        this.value = v;
        this.next = n;
        this.prev = p;
    }
}

export class Timeline<V> {

    private root: TimelineNode<V>;
    constructor() {
        this.root = null;
    }

    public static createFromNodeArray<V>(array: TimelineNode<V>[]) : Timeline<V> {
        let timeline = new Timeline<V>();
        let sortedArray = array.sort((a,b)=> a.key - b.key);
        //sorted in assending order
        for(let node of sortedArray) {
            timeline.insertNodeIgnoreKeyOrder(node);
        }
        return timeline;
    }

    public insert(key: number, value: V) {
        let newNode = new TimelineNode<V>(key,value);
        if(this.root == null) {
            this.root = newNode;
            newNode.next = newNode;
            newNode.prev = newNode;
        } else {
            //insert last
            let currentNode = this.root.next;
            while(true) {
                if(currentNode !== this.root) {
                    if(currentNode.key < key) {
                        currentNode = currentNode.next;
                    } else {
                        this.insertAt(newNode,currentNode);
                    }
                } else {
                    this.insertAt(newNode, this.root);
                }
            }
        }
    }


    public insertKVIgnoreKeyOrder(key: number, value: V) {
        let newNode = new TimelineNode<V>(key,value);
        if(this.root == null) {
            this.root = newNode;
            newNode.next = newNode;
            newNode.prev = newNode;
        } else {
            this.insertAt(newNode, this.root);
        }
    }

    public insertNodeIgnoreKeyOrder(toInsert: TimelineNode<V>) {
        if(this.root == null) {
            this.root = toInsert;
            toInsert.next = toInsert;
            toInsert.prev = toInsert;
        } else {
            this.insertAt(toInsert, this.root);
        }
    }
    
    //insert right before 'AT' Node
    public insertAt(toInsert: TimelineNode<V>, at: TimelineNode<V>) {
        at.prev.next = toInsert;
        toInsert.prev = at.prev;
        at.prev = toInsert;
        toInsert.next = at;
    }

    public search(key: number) : TimelineNode<V>[] {
        let result = [];
        let it = this.iterator();
        it.seekByKey(key);
        let next = it.next();
        while(!next.done && next.value.key == key) {
            result.push(next.value);
            next = it.next();
        }
        return result;
    }

    public removeFirstByKey(key: number) : TimelineNode<V> {
        let it = this.iterator();
        let node = it.seekByKey(key);
        if(node != null) {
            this.remove(node);
        }
        return node;
    }

    public remove(toRemove: TimelineNode<V>) {
        if(toRemove.prev == null || toRemove.next == null) {
            return null;
        }
        toRemove.prev.next = toRemove.next;
        toRemove.next.prev = toRemove.prev;
        return toRemove;
    }

    public iterator() {
        return new TimelineIterator<V>(this);
    }
    get rootNode() {
        return this.root;
    }
}

export interface TimelineIteratResult<V> {
    done: boolean;
    value: V;
}

export class TimelineIterator<V> {
    private timeline: Timeline<V>
    private currentNode: TimelineNode<V>;
    private done: boolean;
    constructor(timeline: Timeline<V>) {
        this.timeline = timeline;
        this.currentNode = timeline.rootNode;
        this.done = false;
    }

    public seekByKey(key: number) {
        this.currentNode = this.timeline.rootNode;
        let maxKey = this.currentNode.prev.key;
        if(key > maxKey) {
            this.done = true;
            return null;
        }
        this.done = false;
        while(key > this.currentNode.key) {
            this.currentNode = this.currentNode.next;
        }
        return this.currentNode;
    }

    public next() : TimelineIteratResult<TimelineNode<V>> {
        let node = this.currentNode;
        let done = this.done;
        this.currentNode = this.currentNode.next;
        if(this.currentNode = this.timeline.rootNode) {
            this.done = true;
        }
        return {done: done, value: node};
    }

    public hasNext() : boolean {
        return this.done;
    }

    public reset() {
        this.done = false;
        this.currentNode = this.timeline.rootNode;
    }

}