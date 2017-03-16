export class TimeLineNode<V> {
    key: number;
    value: V;
    next: TimeLineNode<V>;
    prev: TimeLineNode<V>;
    
    constructor(k: number, v: V, n: TimeLineNode<V> = null, p: TimeLineNode<V> = null) {
        this.key = k;
        this.value = v;
        this.next = n;
        this.prev = p;
    }
}

export class TimeLine<V> {

    private root: TimeLineNode<V>;
    constructor() {
        this.root = null;
    }

    public static createFromNodeArray<V>(array: TimeLineNode<V>[]) : TimeLine<V> {
        let timeline = new TimeLine<V>();
        let sortedArray = array.sort((a,b)=> a.key - b.key);
        //sorted in assending order
        for(let node of sortedArray) {
            timeline.insertNodeIgnoreKeyOrder(node);
        }
        return timeline;
    }

    public insert(key: number, value: V) {
        let newNode = new TimeLineNode<V>(key,value);
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
        let newNode = new TimeLineNode<V>(key,value);
        if(this.root == null) {
            this.root = newNode;
            newNode.next = newNode;
            newNode.prev = newNode;
        } else {
            this.insertAt(newNode, this.root);
        }
    }

    public insertNodeIgnoreKeyOrder(toInsert: TimeLineNode<V>) {
        if(this.root == null) {
            this.root = toInsert;
            toInsert.next = toInsert;
            toInsert.prev = toInsert;
        } else {
            this.insertAt(toInsert, this.root);
        }
    }
    
    //insert right before 'AT' Node
    public insertAt(toInsert: TimeLineNode<V>, at: TimeLineNode<V>) {
            at.prev.next = toInsert;
            toInsert.prev = at.prev;
            at.prev = toInsert;
            toInsert.next = at;
    }

    get rootKey() {
        return this.root.key;
    }
}

export class TimeLineIterator {
    private timeline: TimeLine<V>
    private startingKey: number;
    constructor(timeline: TimeLine<V>) {
        this.timeline = timeline;
        this.startingKey = timeline.rootKey;
    }
}