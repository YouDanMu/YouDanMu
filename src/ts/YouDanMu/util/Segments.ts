export class Segment {
    start: number;
    end: number;
    ref: number;

    constructor(start: number, end: number, ref?: number) {
        if (start >= end) throw new Error('Non-positive range.');
        this.start = start;
        this.end = end;
        this.ref = ref || 0;
    }

    get length(): number {
        return this.end - this.start;
    }

    clone(): Segment {
        return new Segment(this.start, this.end, this.ref);
    }

    split(...points: number[]): Segment[] {
        if (points == null || !points.length)
            throw new Error('Invalid split points.');
        let ret: Segment[] = [];
        let prev: number = null;
        points.reduce((prev, point, i, arr) => {
            if (point <= prev || point >= this.end)
                throw new Error(`Invalid split point ${point}.`);
            ret.push(new Segment(prev, point, this.ref));
            if (i === arr.length - 1)
                ret.push(new Segment(point, this.end, this.ref));
            return point;
        }, this.start);
        return ret;
    }

    toString(): string {
        return `[${this.start}, (${this.ref}), ${this.end}]`;
    }
}

export class Segments {
    start: number;
    end: number;
    segments: Segment[];

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
        this.reset();
    }

    get range(): number {
        return this.end - this.start;
    }

    reset() {
        this.segments = [new Segment(this.start, this.end)];
    }

    take(length: number, descend = false): Segment {
        if (!length) return null;
        if (length > this.range)
            throw new Error('Length exceeds segments range.');
        return descend ? this._takeDescend(length) : this._takeAscend(length);
    }

    private _takeAscend(length: number): Segment {
        const { segments } = this;
        let fit: Segment = null;
        for (let i = 0; i < segments.length; ++i) {
            let s = segments[i];
            if (this.end - s.start < length) break;
            if (s.ref === 0 && s.length >= length) {
                // Immediately finish if we found a fitting segment with 0 reference
                fit = s;
                break;
            }
            let deepS = s, t = s; // The segment so far has most references
            let deepIdx = i, j = i;
            let sumLen = s.length; // The summed length so far
            while (sumLen < length) {
                t = segments[++j]; // Add the next segment's length
                sumLen += t.length;
                if (t.ref > deepS.ref) deepS = t, deepIdx = j;
            }
            if (fit == null || fit.ref > deepS.ref) fit = s;
            i = deepIdx;
        }
        return this.ref(fit.start, fit.start + length);
    }

    private _takeDescend(length: number): Segment {
        const { segments } = this;
        let fit: Segment = null;
        for (let i = segments.length - 1; i >= 0; --i) {
            let s = segments[i];
            if (s.end - this.start < length) break;
            if (s.ref === 0 && s.length >= length) {
                // Immediately finish if we found a fitting segment with 0 reference
                fit = s;
                break;
            }
            let deepS = s, t = s; // The segment so far has most references
            let deepIdx = i, j = i;
            let sumLen = s.length; // The summed length so far
            while (sumLen < length) {
                t = segments[--j]; // Add the next segment's length
                sumLen += t.length;
                if (t.ref > deepS.ref) deepS = t, deepIdx = j;
            }
            if (fit == null || fit.ref > deepS.ref) fit = s;
            i = deepIdx;
        }
        return this.ref(fit.end - length, fit.end);
    }

    put(s: Segment) {
        this.deref(s.start, s.end);
    }

    private _ref(start: number, end: number, delta: number): Segment {
        if (start < this.start || end > this.end)
            throw new Error('Range exceeds segments range.');
        const { segments } = this;
        let depth: number = null;
        let prev: Segment = null;
        for (let i = 0; i < segments.length; ++i) {
            let s = segments[i];
            if (start < s.end && end > s.start) {
                if (depth == null || s.ref > depth) depth = s.ref;
                if (start <= s.start) {
                    if (end >= s.end) {
                        s.ref += delta;
                    } else if (end > s.start && end < s.end) {
                        let b = s.split(end);
                        b[0].ref += delta;
                        s = b[0];
                        segments.splice(i, 1, ...b);
                    }
                } else if (start > s.start) {
                    if (end >= s.end) {
                        let b = s.split(start);
                        s = b[0];
                        segments.splice(i, 1, ...b);
                    } else if (end < s.end) {
                        let b = s.split(start, end);
                        s = b[0];
                        segments.splice(i, 1, ...b);
                    }
                }
            }
            // Merge into left segment if the references equal
            if (prev && s.ref === prev.ref)
                segments.splice(--i, 2, new Segment(prev.start, s.end, s.ref));
            prev = s;
        }
        return new Segment(start, end, depth + delta);
    }

    ref(start: number | Segment, end?: number): Segment {
        if (start instanceof Segment) 
            return this._ref(start.start, start.end, 1);
        return this._ref(start, end, 1);
    }

    deref(start: number | Segment, end?: number): Segment {
        if (start instanceof Segment) 
            return this._ref(start.start, start.end, -1);
        return this._ref(start, end, -1);
    }

    toString() {
        return `{ ${this.segments.map(s => s.toString()).join(', ')} }`;
    }
}

(<any>window).Segment = Segment;
(<any>window).Segments = Segments;
