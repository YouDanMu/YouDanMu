import { Segment, Segments } from '../YouDanMu/util/Segments';

const { expect } = chai;

describe('util/Segment', () => {
    it('should construct with start, end, and ref count', () => {
        const s = new Segment(20, 100, 2);
        expect(s.start).to.equal(20);
        expect(s.end).to.equal(100);
        expect(s.ref).to.equal(2);
    });

    it('should clone with start, end, and ref count', () => {
        const s = new Segment(20, 100, 2);
        const c = s.clone();
        expect(c.start).to.equal(20);
        expect(c.end).to.equal(100);
        expect(c.ref).to.equal(2);
    });

    it('should be able to split into 2 parts', () => {
        const s = new Segment(20, 100, 2);
        const parts = s.split(50);
        expect(parts).to.have.length(2);
        expect(parts[0].start).to.equal(20);
        expect(parts[0].end).to.equal(50);
        expect(parts[0].ref).to.equal(2);
        expect(parts[1].start).to.equal(50);
        expect(parts[1].end).to.equal(100);
        expect(parts[1].ref).to.equal(2);
    });

    it('should be able to split into 10 parts', () => {
        const s = new Segment(20, 100, 2);
        const parts = s.split(30,35,40,41,52.49521,69,70,91,92);
        expect(parts).to.have.length(10);
        expect(parts[0].start).to.equal(20);
        expect(parts[0].end).to.equal(30);
        expect(parts[0].ref).to.equal(2);
        expect(parts[1].start).to.equal(30);
        expect(parts[1].end).to.equal(35);
        expect(parts[1].ref).to.equal(2);
        expect(parts[2].start).to.equal(35);
        expect(parts[2].end).to.equal(40);
        expect(parts[2].ref).to.equal(2);
        expect(parts[3].start).to.equal(40);
        expect(parts[3].end).to.equal(41);
        expect(parts[3].ref).to.equal(2);
        expect(parts[4].start).to.equal(41);
        expect(parts[4].end).to.equal(52.49521);
        expect(parts[4].ref).to.equal(2);
        expect(parts[5].start).to.equal(52.49521);
        expect(parts[5].end).to.equal(69);
        expect(parts[5].ref).to.equal(2);
        expect(parts[6].start).to.equal(69);
        expect(parts[6].end).to.equal(70);
        expect(parts[6].ref).to.equal(2);
        expect(parts[7].start).to.equal(70);
        expect(parts[7].end).to.equal(91);
        expect(parts[7].ref).to.equal(2);
        expect(parts[8].start).to.equal(91);
        expect(parts[8].end).to.equal(92);
        expect(parts[8].ref).to.equal(2);
        expect(parts[9].start).to.equal(92);
        expect(parts[9].end).to.equal(100);
        expect(parts[9].ref).to.equal(2);
    });

    it('should be able to convert to string', () => {
        const s = new Segment(20, 100, 2);
        expect(s.toString()).to.equal('[20, (2), 100]');
    });

    it('should throw when constructing with start >= end', () => {
        expect(() => {
            new Segment(20, 10);
        }).to.throw('Non-positive range.');
        expect(() => {
            new Segment(20, 20);
        }).to.throw('Non-positive range.');
    });

    it('should throw when split with no arguments', () => {
        expect(() => {
            new Segment(10, 20).split();
        }).to.throw('Invalid split points.');
    });

    it('should throw when split at start or end', () => {
        expect(() => {
            new Segment(10, 20).split(10);
        }).to.throw('Invalid split point 10.');
        expect(() => {
            new Segment(10, 20).split(20);
        }).to.throw('Invalid split point 20.');
    });

    it('should throw when split at outside the range', () => {
        expect(() => {
            new Segment(10, 20).split(1);
        }).to.throw('Invalid split point 1.');
        expect(() => {
            new Segment(10, 20).split(100);
        }).to.throw('Invalid split point 100.');
    });

    it('should throw when split at points not in increasing order', () => {
        expect(() => {
            new Segment(10, 20).split(11, 13, 12);
        }).to.throw('Invalid split point 12.');
        expect(() => {
            new Segment(10, 20).split(11, 12, 12, 13);
        }).to.throw('Invalid split point 12.');
    });
});

describe('util/Segments', () => {
    it('should construct with start and end', () => {
        const s = new Segments(20, 100);
        expect(s.start).to.equal(20);
        expect(s.end).to.equal(100);
        expect(s.range).to.equal(80);
        expect(s.segments).to.have.length(1);
        expect(s.segments[0].toString()).to.equal('[20, (0), 100]');
    });

    it('should take and put a small part from the start', () => {
        const s = new Segments(20, 100);
        const p = s.take(10);
        expect(p.toString()).to.equal('[20, (1), 30]');
        expect(s.toString()).to.equal('{ [20, (1), 30], [30, (0), 100] }');
        s.put(p);
        expect(s.toString()).to.equal('{ [20, (0), 100] }');
    });

    it('should take and put several parts', () => {
        const s = new Segments(20, 100);
        const p1 = s.take(10);
        expect(p1.toString()).to.equal('[20, (1), 30]');
        const p2 = s.take(25);
        expect(p2.toString()).to.equal('[30, (1), 55]');
        const p3 = s.take(37.6);
        expect(p3.toString()).to.equal('[55, (1), 92.6]');
        const p4 = s.take(50);
        expect(p4.toString()).to.equal('[20, (2), 70]');
        const p5 = s.take(30.122);
        expect(p5.toString()).to.equal('[20, (3), 50.122]');
        expect(s.toString()).to.equal('{ [20, (3), 50.122], [50.122, (2), 70], [70, (1), 92.6], [92.6, (0), 100] }');
        const p6 = s.take(15, true);
        expect(p6.toString()).to.equal('[85, (2), 100]');
        expect(s.toString()).to.equal('{ [20, (3), 50.122], [50.122, (2), 70], [70, (1), 85], [85, (2), 92.6], [92.6, (1), 100] }');
        const p7 = s.take(38, true);
        expect(p7.toString()).to.equal('[62, (3), 100]');
        expect(s.toString()).to.equal('{ [20, (3), 50.122], [50.122, (2), 62], [62, (3), 70], [70, (2), 85], [85, (3), 92.6], [92.6, (2), 100] }');
    });

    it('should ref and deref several parts', () => {
        const s = new Segments(20, 100);
        let p1 = s.ref(30, 50);
        expect(p1.toString()).to.equal('[30, (1), 50]');
        expect(s.toString()).to.equal('{ [20, (0), 30], [30, (1), 50], [50, (0), 100] }');
        let p2 = s.ref(35, 45);
        expect(p2.toString()).to.equal('[35, (2), 45]');
        expect(s.toString()).to.equal('{ [20, (0), 30], [30, (1), 35], [35, (2), 45], [45, (1), 50], [50, (0), 100] }');
        let p3 = s.ref(25, 40);
        expect(p3.toString()).to.equal('[25, (3), 40]');
        expect(s.toString()).to.equal('{ [20, (0), 25], [25, (1), 30], [30, (2), 35], [35, (3), 40], [40, (2), 45], [45, (1), 50], [50, (0), 100] }');
        let p4 = s.ref(40, 55);
        expect(p4.toString()).to.equal('[40, (3), 55]');
        expect(s.toString()).to.equal('{ [20, (0), 25], [25, (1), 30], [30, (2), 35], [35, (3), 45], [45, (2), 50], [50, (1), 55], [55, (0), 100] }');
        p1 = s.deref(p1);
        expect(p1.toString()).to.equal('[30, (2), 50]');
        expect(s.toString()).to.equal('{ [20, (0), 25], [25, (1), 35], [35, (2), 45], [45, (1), 55], [55, (0), 100] }');
        p3 = s.deref(p3);
        expect(p3.toString()).to.equal('[25, (1), 40]');
        expect(s.toString()).to.equal('{ [20, (0), 35], [35, (1), 40], [40, (2), 45], [45, (1), 55], [55, (0), 100] }');
        expect(s.deref(40, 55).toString()).to.equal('[40, (1), 55]');
        expect(s.toString()).to.equal('{ [20, (0), 35], [35, (1), 45], [45, (0), 100] }');
        expect(s.deref(35, 45).toString()).to.equal('[35, (0), 45]');
        expect(s.toString()).to.equal('{ [20, (0), 100] }');
    });
});
