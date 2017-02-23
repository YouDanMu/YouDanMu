import { Danmaku } from '../content-script/Danmaku';

const { expect } = chai;

describe('Danmaku constructor', () => {
    it('should assign default values', () => {
        const d = new Danmaku();
        expect(d.mode).to.equal(Danmaku.defaults.mode);
    });
});