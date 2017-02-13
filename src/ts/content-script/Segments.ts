export class Segment {
    start: number;
    end: number;

    constructor(start: number, end: number) {
        if (start > end) throw new Error('Segment start is greater than end.');
        this.start = start;
        this.end = end;
    }

    length(): number {
        return this.end - this.start;
    }

    copy(): Segment {
        return new Segment(this.start, this.end);
    }

    intersection(s: Segment): Segment {
        if (this.start >= s.end || this.end <= s.start) {
            return null;
        }
        return new Segment(
            (this.start > s.start) ? this.start : s.start,
            (this.end < s.end) ? this.end : s.end
        );
    }

    union(s: Segment): Segment[] {
        let r: Segment[] = [];
        if (this.end < s.start) {
            r.push(this.copy());
            r.push(s.copy());
        } else if (this.start > s.end) {
            r.push(s.copy());
            r.push(this.copy());
        } else {
            r.push(new Segment(
                (this.start < s.start) ? this.start : s.start,
                (this.end > s.end) ? this.end : s.end
            ));
        }
        return r;
    }

    subtract(s: Segment): Segment[] {
        let r: Segment[] = [];
        if (this.start < s.start) {
            r.push(this.copy());
            if (this.end > s.start) {
                r[r.length-1].end = s.start;
            }
        }
        if (this.end > s.end) {
            r.push(this.copy());
            if (this.start < s.end) {
                r[r.length-1].start = s.end;
            }
        }
        return r;
    }
}

export class Segments {
    range: Segment;
    segments: Segment[] = [];

    constructor(s: Segment) {
        this.range = s.copy();
        this.segments.push(s.copy());
    }

    reset() {
        this.segments = [this.range.copy()];
    }

    trim(s: Segment): Segment {
        return new Segment(
            (s.start < this.range.start) ? this.range.start : s.start,
            (s.end > this.range.end) ? this.range.end : s.end
        );
    }

    subtract(s: Segment) {
        s = this.trim(s);
        for (let i = 0; i < this.segments.length; i++) {
            let m = this.segments[i];
            let n = m.subtract(s);
            switch (n.length) {
            case 0:
                this.segments.splice(i, 1);
                break;
            case 1:
                this.segments.splice(i, 1, n[0]);
                break;
            case 2:
                this.segments.splice(i, 1, n[0], n[1]);
                break;
            }
        }
    }

    add(s: Segment) {
        let i;
        s = this.trim(s);
        for (i = 0; i < this.segments.length && this.segments[i].start < s.start; i++);
        this.segments.splice(i, 0, s);
        while (i + 1 < this.segments.length && this.segments[i+1].start <= s.end) {
            if (s.end < this.segments[i+1].end)
                s.end = this.segments[i+1].end;
            this.segments.splice(i+1, 1);
        }
        while (i - 1 >= 0 && this.segments[i-1].end >= s.start) {
            if (s.start > this.segments[i-1].start)
                s.start = this.segments[i-1].start;
            this.segments.splice(i-1, 1);
            i--;
        }
    }

    findFirst(length: number): Segment {
        for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i].length() >= length)
                return new Segment(
                    this.segments[i].start,
                    this.segments[i].start + length
                );
        }
        return null;
    }

    findLast(length: number): Segment {
        for (let i = this.segments.length; i -- > 0;) {
            if (this.segments[i].length() >= length)
                return new Segment(
                    this.segments[i].end - length,
                    this.segments[i].end
                );
        }
        return null;
    }

    print() {
        let arr = this.segments.map((s) => `[${s.start}, ${s.end}]`);
        console.log(`[${arr.toString()}]`);
    }
}

(<any>window).Segment = Segment;
(<any>window).Segments = Segments;
