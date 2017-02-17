///<reference path="../node_modules/@types/jasmine/index.d.ts"/>
import { YDM } from '../src/ts/content-script/YDM';

describe("test test", () => {

    let ydm = new YDM();

    it("should return", () => {
        expect(ydm.onVideoScreenCreated()).toBe("Hello World");
    });
    
})
