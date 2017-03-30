import { SVGRenderService } from '../YouDanMu/RenderService';
import { SVGDanmakuMarquee } from '../YouDanMu/RenderService/SVGRenderService/SVGDanmakuMarquee'
import { SVGDanmakuTop } from '../YouDanMu/RenderService/SVGRenderService/SVGDanmakuTop'
import { SVGDanmakuBottom } from '../YouDanMu/RenderService/SVGRenderService/SVGDanmakuBottom'
import { SVGCanvas } from '../YouDanMu/RenderService/SVGRenderService/SVGCanvas'
import { YouDanMu } from '../YouDanMu';
import { Danmaku, Mode } from '../YouDanMu/Danmaku';
import { Screen, Seconds, PlayerState, PlayerEvent } from '../YouDanMu/VideoService';
import { YouTube } from './stub';

const Color = require('color');

const { expect } = chai;


function createSVGTextElement(d: Danmaku): SVGTextElement {
    const e = document.createElementNS(
        'http://www.w3.org/2000/svg', 'text');
    e.classList.add('ydn-svg-danmaku');
    e.textContent = d.text;
    e.style.fontSize = d.size;
    e.style.fill = d.color.string();
    // TODO: apply defaults
    if(d.color.dark()) {
        e.style.textShadow =
            'rgb(255, 255, 255) 1px 0px 1px'
            + ', rgb(255, 255, 255) 0px 1px 1px'
            + ', rgb(255, 255, 255) 0px -1px 1px'
            + ', rgb(255, 255, 255) -1px 0px 1px';
    } else {
        e.style.textShadow =
            'rgb(0, 0, 0) 1px 0px 1px'
            + ', rgb(0, 0, 0) 0px 1px 1px'
            + ', rgb(0, 0, 0) 0px -1px 1px'
            + ', rgb(0, 0, 0) -1px 0px 1px';
    }
    e.style.fontFamily = 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif';
    e.style.fontWeight = 'bold';
    e.style.lineHeight = '1.125';
    return e;
}


export function SVGRenderServiceTest(prev: Promise<any>, ydm: YouDanMu, yt: YouTube.API): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('RenderService/SVGRenderService', () => {

            let renderer = ydm.renderService;

            if(prev) before(done => void prev.then(done));

            after(() => resolve());


            it('should install canvas on PlayerEvent.screenInit', () => {
                yt.player.mount();
                let e = ydm.videoService.screen.value.e;
                expect(e.getElementsByClassName('ydm-svg-canvas')[0]).not.null;



            });

            it('should insert Danmaku into timeline', () => {
                let d: Danmaku = {
                    text: "testInsert",
                    time: Number(12),
                    mode: Mode.MARQUEE,
                    size: 12 + 'px',
                    color: Color('#000000')
                };
                renderer.addDanmaku(d);
                (<any>renderer).timeline


            })


        });
    });
}


export function SVGDanmakuTest(prev: Promise<any>): Promise<void> {
    let danmakuTests : { (prev: Promise<any>) : Promise<void>;} [] = [
        SVGDanmakuMarqueeTest, 
        SVGDanmakuTopTest,
        SVGDanmakuBottomTest
        ];
    for(var test of danmakuTests) {
        prev = test(prev);
    }

    return prev;
}

export function SVGDanmakuMarqueeTest(prev: Promise<any>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('RenderService/SVGDanmakuMarquee', () => {


            if(prev) before(done => void prev.then(done));

            after(() => resolve());

            let d1: Danmaku = {
                text: Math.random().toString(36),
                time: Number(12),
                mode: Mode.MARQUEE,
                size: 12 + 'px',
                color: Color('#000000')
            };

            let e1 = createSVGTextElement(d1);

            let canvas = new SVGCanvas(3);
            canvas.width = 1280;
            canvas.height = 720;

            let A = new SVGDanmakuMarquee(d1, e1, canvas);
            A.startTime = 0; A.fullyEntryTime = 10; A.beginLeaveTime = 12; A.endTime = 22; (<any>A).speed = 1;
            let B = { startTime: 11, fullyEntryTime: 12, beginLeaveTime: 23, endTime: 24 } as SVGDanmakuMarquee;



            it('should tell if the two danmakus collided with each other if not colliding', () => {
                expect(A.collide(B)).to.be.false;
            });

            it('should tell if the two danmakus collided with each other if colliding by startTime/fullyEntryTime', () => {
                B.startTime = 9;
                expect(A.collide(B)).to.be.true;
                B.startTime = 11; A.fullyEntryTime = 12;
                expect(A.collide(B)).to.be.true;
                A.fullyEntryTime = 10;
            });

            it('should tell if the two danmakus collided with each other if colliding by beginLeaveTime/leaveTime', () => {
                B.beginLeaveTime = 21;
                expect(A.collide(B)).to.be.true;
                B.beginLeaveTime = 23;
            });

            it('should tell if the danmaku will expire at a given time', () => {
                expect(A.expire(10)).to.be.false;
                expect(A.expire(0)).to.be.false;
                expect(A.expire(22)).to.be.false;
                expect(A.expire(23)).to.be.true;
                expect(A.expire(-1)).to.be.true;
            });

            it('should be able to tell next frame x coordinate on timeslice', () => {
                (<any>A).speed = 1;
                A.x = 100;
                A.nextFrame(0, 1);
                expect(A.x).to.equal(99);
                (<any>A).speed = 2.5;
                A.x = 10;
                A.nextFrame(0, 1);
                expect(A.x).to.equal(7.5);
                A.nextFrame(0, 1);
                expect(A.x).to.equal(5);
                A.nextFrame(0, 2);
                expect(A.x).to.equal(0);
            });

            it('should be able to tell baseframe base on time', () => {
                (<any>A).speed = 1;
                A.x = 100;
                A.baseFrame(10);
                expect(A.x).to.equal(1270);
                A.baseFrame(100);
                expect(A.x).to.equal(1180);
                (<any>A).speed = 2;
                A.baseFrame(100);
                expect(A.x).to.equal(1080);
            });


        });
    });
}

export function SVGDanmakuBottomTest(prev: Promise<any>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('RenderService/SVGDanmakuBottom', () => {


            if(prev) before(done => void prev.then(done));

            after(() => resolve());

            let d1: Danmaku = {
                text: Math.random().toString(36),
                time: Number(12),
                mode: Mode.MARQUEE,
                size: 12 + 'px',
                color: Color('#000000')
            };

            let e1 = createSVGTextElement(d1);

            let canvas = new SVGCanvas(3);
            canvas.width = 1280;
            canvas.height = 720;

            let A = new SVGDanmakuBottom(d1, e1, canvas);
            A.startTime = 0;; A.endTime = 22; (<any>A).speed = 1;
            let B = { startTime: 22, endTime: 24 } as SVGDanmakuBottom;



            it('should tell if the two danmakus collided with each other if not colliding', () => {
                expect(A.collide(B)).to.be.false;
            });

            it('should tell if the two danmakus collided with each other if colliding by startTime/endTime', () => {
                B.startTime = 9;
                expect(A.collide(B)).to.be.true;
                B.startTime = 11;
                expect(A.collide(B)).to.be.true;
                B.startTime = 22;
            });

            it('should tell if the danmaku will expire at a given time', () => {
                expect(A.expire(10)).to.be.false;
                expect(A.expire(0)).to.be.false;
                expect(A.expire(22)).to.be.false;
                expect(A.expire(23)).to.be.true;
                expect(A.expire(-1)).to.be.true;
            });

            it('should be able to tell next frame x coordinate on timeslice', () => {
                (<any>A).speed = 1;
                A.x = 100;
                A.nextFrame(0, 1);
                expect(A.x).to.equal(100);
                (<any>A).speed = 2.5;
                A.x = 10;
                A.nextFrame(0, 1);
                expect(A.x).to.equal(10);
                A.nextFrame(0, 1);
                expect(A.x).to.equal(10);
                A.nextFrame(0, 2);
                expect(A.x).to.equal(10);
            });

            it('should be able to tell baseframe base on time', () => {
                (<any>A).width = 100;
                A.x = 100;
                A.baseFrame(10);
                expect((<any>A).width).equal(100);
                expect((<any>A).canvasW).equal(1280);
                expect(A.x).to.equal(590);
                A.baseFrame(100);
                expect(A.x).to.equal(590);
                (<any>A).speed = 2;
                A.baseFrame(100);
                expect(A.x).to.equal(590);
                A.x = 1;
                A.baseFrame(0);
                expect(A.x).to.equal(590);
            });

            it('should be able to get/set y', () => {
                A.y = 10;
                expect(A.y).to.equal(10);
                expect(parseFloat(A.e.getAttribute('y'))).to.equal(2);
                A.y = 8.4;
                expect(A.y).to.equal(8.4);
                expect(parseFloat(A.e.getAttribute('y'))).to.equal(0.4);
            });


        });
    });
}

export function SVGDanmakuTopTest(prev: Promise<any>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('RenderService/SVGDanmakuTop', () => {


            if(prev) before(done => void prev.then(done));

            after(() => resolve());

            let d1: Danmaku = {
                text: Math.random().toString(36),
                time: Number(12),
                mode: Mode.MARQUEE,
                size: 12 + 'px',
                color: Color('#000000')
            };

            let e1 = createSVGTextElement(d1);

            let canvas = new SVGCanvas(3);
            canvas.width = 1280;
            canvas.height = 720;

            let A = new SVGDanmakuTop(d1, e1, canvas);
            A.startTime = 0;; A.endTime = 22; (<any>A).speed = 1;
            let B = { startTime: 22, endTime: 24 } as SVGDanmakuTop;



            it('should tell if the two danmakus collided with each other if not colliding', () => {
                expect(A.collide(B)).to.be.false;
            });

            it('should tell if the two danmakus collided with each other if colliding by startTime/endTime', () => {
                B.startTime = 9;
                expect(A.collide(B)).to.be.true;
                B.startTime = 11;
                expect(A.collide(B)).to.be.true;
                B.startTime = 22;
            });

            it('should tell if the danmaku will expire at a given time', () => {
                expect(A.expire(10)).to.be.false;
                expect(A.expire(0)).to.be.false;
                expect(A.expire(22)).to.be.false;
                expect(A.expire(23)).to.be.true;
                expect(A.expire(-1)).to.be.true;
            });

            it('should be able to tell next frame x coordinate on timeslice', () => {
                (<any>A).speed = 1;
                A.x = 100;
                A.nextFrame(0, 1);
                expect(A.x).to.equal(100);
                (<any>A).speed = 2.5;
                A.x = 10;
                A.nextFrame(0, 1);
                expect(A.x).to.equal(10);
                A.nextFrame(0, 1);
                expect(A.x).to.equal(10);
                A.nextFrame(0, 2);
                expect(A.x).to.equal(10);
            });

            it('should be able to tell baseframe base on time', () => {
                (<any>A).width = 100;
                A.x = 100;
                A.baseFrame(10);
                expect((<any>A).width).equal(100);
                expect((<any>A).canvasW).equal(1280);
                expect(A.x).to.equal(590);
                A.baseFrame(100);
                expect(A.x).to.equal(590);
                (<any>A).speed = 2;
                A.baseFrame(100);
                expect(A.x).to.equal(590);
                A.x = 1;
                A.baseFrame(0);
                expect(A.x).to.equal(590);
            });


        });
    });
}



