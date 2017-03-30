import { IntervalTree } from '../Youdanmu/util'

const { expect } = chai;

export function IntervalTreeTest(prev: Promise<any>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('util/IntervalTree', () => {

            if (prev) before(done => void prev.then(done));

            after(() => resolve());

           

            const T1 = {start: 0, end: 10, value: "T1"};
            const T2 = {start: 10, end: 2000, value: "T2"}; 

            it('should be able to intsert Node into tree', () => {
                const tree = new IntervalTree<string>();
                tree.insert(T1.start,T2.end,T1.value);
                expect(tree.findInterval(T1.start,T2.end,).values[0]).to.equal(T1.value);
                tree.insert(T2.start,T2.end,T2.value);
                expect(tree.findInterval(T2.start,T2.end).values[0]).to.equal(T2.value);
                const randomEnd : number = Math.round(Math.random() * 100);
                const randomSta = randomEnd - 10 < 0 ? 0 : randomEnd -10;
                const randomStr : string = Math.random().toString(36);
                
                tree.insert(randomSta, randomEnd, randomStr);
                expect(tree.findInterval(randomSta,randomEnd).values[0]).to.equal(randomStr);
            });

            it('should be able to find Node base on exact start/end time', () => {
                const tree = new IntervalTree<string>();
                tree.insert(T1.start,T1.end,T1.value);
                expect(tree.findInterval(T1.start,T1.end).values[0]).to.equal(T1.value);
                tree.insert(T2.start,T2.end,T2.value);
                expect(tree.findInterval(T2.start,T2.end).values[0]).to.equal(T2.value);
                const randomEnd : number = Math.round(Math.random() * 100);
                const randomSta = randomEnd - 10 < 0 ? 0 : randomEnd -10;
                const randomStr : string = Math.random().toString(36);
                tree.insert(randomSta, randomEnd, randomStr);
                expect(tree.findInterval(randomSta,randomEnd).values[0]).to.equal(randomStr);
            });

            it('should be able to search Node base on start/end time', () => {
                const tree = new IntervalTree<string>();
                tree.insert(T1.start,T1.end,T1.value);
                tree.insert(T2.start,T2.end,T2.value);
                expect(tree.searchInterval(0,10000)).contains(tree.findInterval(T1.start,T1.end))
                expect(tree.searchInterval(0,10000)).contains(tree.findInterval(T2.start,T2.end))
            });

            it('should be able to search Node base on time point', () => {
                const tree = new IntervalTree<string>();
                tree.insert(T1.start,T1.end,T1.value);
                tree.insert(T2.start,T2.end,T2.value);
                expect(tree.searchPoint(5)).contains(tree.findInterval(T1.start,T1.end))
                expect(tree.searchPoint(100)).contains(tree.findInterval(T2.start,T2.end))
                expect(tree.searchPoint(5)).not.contains(tree.findInterval(T2.start,T2.end))
                expect(tree.searchPoint(100)).not.contains(tree.findInterval(T1.start,T1.end))
            });

        });
    });
}