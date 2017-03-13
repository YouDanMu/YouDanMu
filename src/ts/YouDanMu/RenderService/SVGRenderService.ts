import { Subject } from 'rxjs/Subject';

import { RenderService } from '.';
import { Danmaku, Mode } from '../Danmaku';
import { Seconds } from '../VideoService';
import { Screen } from '../VideoService';
import {
    DataIntervalTree as IntervalTree,
    DataIntervalTreeIterator as IntervalTreeIterator
} from '../util/IntervalTree';

class Canvas implements Iterable<DanmakuObject> {
    parent: HTMLDivElement;
    layers: SVGElement[] = [];
    prepare: SVGElement;

    width: number;
    height: number;

    private danmakuSet = new Set<DanmakuObject>();

    constructor(layers: number) {
        this.parent = document.createElement('div');
        this.prepare = document.createElementNS(
            'http://www.w3.org/2000/svg', 'svg');
        this.parent.classList.add('ydm-svg-canvas');
        this.prepare.classList.add('ydm-svg-canvas-prepare');
        for (let i = 0; i < layers; i++) {
            const layer = document.createElementNS(
                'http://www.w3.org/2000/svg', 'svg');
            layer.classList.add('ydm-svg-canvas-layer');
            this.layers.push(layer);
            this.parent.appendChild(layer);
        }
        this.parent.appendChild(this.prepare);
    }

    add(d: DanmakuObject) {
        this.danmakuSet.add(d);
        this.layers[d.layer].appendChild(d.getDOM());
    }

    remove(d: DanmakuObject) {
        this.danmakuSet.delete(d);
        this.layers[d.layer].removeChild(d.getDOM());
    }

    getDOM() {
        return this.parent;
    }

    clear() {
        for (let d of this.danmakuSet) {
            d.conceal();
        }
    }

    [Symbol.iterator](): Iterator<DanmakuObject> {
        return this.danmakuSet[Symbol.iterator]();
    }
}

class DanmakuObject {
    d: Danmaku;
    e: SVGTextElement;
    canvas: Canvas;

    private _width: number;
    private _height: number;
    private _canvasW: number;

    constructor(d: Danmaku, canvas: Canvas) {
        this.d = d;
        this.canvas = canvas;
        this.e = document.createElementNS(
            'http://www.w3.org/2000/svg', 'text');
        this.e.classList.add('ydn-svg-danmaku');
        this.e.textContent = d.text;
        this.e.style.fontSize = d.size;
        this.e.style.fill = d.color;
        this.e.style.opacity = d.opacity;
        this.e.style.fontFamily = d.font;
        this.e.style.textShadow = d.shadow;
        this.e.style.padding = d.padding;
        this._canvasW = canvas.width;
    }

    get startTime(): Seconds {
        return this.d.time;
    }

    get endTime(): Seconds {
        return this.startTime + this.duration;
    }

    get duration(): Seconds {
        return this._canvasW / this.speed;
    }

    get speed(): number {
        return 0.22 * this.width + 113.78;
    }

    get x(): number {
        return parseFloat(this.e.getAttribute('x'));
    }

    set x(x: number) {
        this.e.setAttribute('x', x.toString());
    }

    get y(): number {
        return parseFloat(this.e.getAttribute('y'));
    }

    set y(y: number) {
        this.e.setAttribute('y', y.toString());
    }

    get width(): number {
        if (this._width == null) this.measure();
        return this._width;
    }

    get height(): number {
        if (this._height == null) this.measure();
        return this._height;
    }

    get layer(): number {
        return this.d.mode;
    }

    getDOM(): SVGTextElement {
        return this.e;
    }

    isDisplay(): boolean {
        return this.e.parentNode != null;
    }

    isDisplayAt(time: Seconds): boolean {
        return time > this.startTime && time < this.endTime;
    }

    display(time: Seconds) {
        this.x = this._canvasW - time * this.speed;
        this.canvas.add(this);
    }

    conceal() {
        this.canvas.remove(this);
    }

    frameUpdate(timeslice: Seconds) {
        if (this.d.mode === Mode.MARQUEE) {
            const x = this.x - timeslice * this.speed;
            if (x < -this.width) return void this.conceal();
            this.x = x;
        }
    }

    private measure() {
        const e = <SVGTextElement>this.e.cloneNode(true);
        this.canvas.prepare.appendChild(e);
        this._width = e.clientWidth;
        this._height = e.clientHeight;
        e.remove();
    }
}

export class SVGRenderService implements RenderService {
    danmakuInput = new Subject<Danmaku>();
    playInput = new Subject<Seconds>();
    pauseInput = new Subject<Seconds>();
    screenInitInput = new Subject<Screen>();
    screenResizeInput = new Subject<Screen>();

    private canvas: Canvas;
    private timeline = new IntervalTree<DanmakuObject>();
    private timelineIterator: IntervalTreeIterator<DanmakuObject>;

    private screenCache = new Map<string,IntervalTree<DanmakuObject>>();

    private playing = false;

    private time: Seconds;
    private timestamp: number = null;
    private animationFrame: number = null;

    constructor() {
        // Create canvas with one layer for each Danmaku mode
        this.canvas = new Canvas(Mode._modeCount);
        this.danmakuInput.subscribe(d => this.onDanmakuInput(d));
        this.screenInitInput.subscribe(s => this.onScreenInit(s));
        this.screenResizeInput.subscribe(s => this.onScreenResize(s));
    }

    private onDanmakuInput(danmaku: Danmaku) {
        const d = new DanmakuObject(danmaku, this.canvas);
        this.timeline.add(d, d.startTime, d.endTime);
        if (d.isDisplayAt(this.time))
            d.display(this.time);
    }

    private onScreenInit(screen: Screen) {
        this.canvas.width = screen.width;
        this.canvas.height = screen.height;
        screen.installCanvas(this.canvas.getDOM());
    }

    private onScreenResize(screen: Screen) {
        const previousScreenId = `${this.canvas.width}`;
        this.screenCache.set(previousScreenId, this.timeline);
        const screenId = `${screen.width}`;
        this.canvas.width = screen.width;
        this.canvas.height = screen.height;
        if (this.screenCache.has(screenId)) {
            this.timeline = this.screenCache.get(screenId);
        } else {
            const timeline = new IntervalTree<DanmakuObject>();
            for (const dOld of this.timeline) {
                const dNew = new DanmakuObject(dOld.d, this.canvas);
            }
        }
    }

    /**
     * The base frame refreshly renders all elements at a given base
     * time point, with no dependency on previous states. If we are at
     * the playing state, it starts the next frame call.
     * 
     * @private
     * @param {Seconds} time 
     * 
     * @memberOf SVGRenderService
     */
    private baseFrame() {
        const { timeline, time } = this;
        this.canvas.clear();
        for (let d in timeline.overlapAt(time)) {
            d.display(time);
        }
        this.timelineIterator = timeline.iterateFrom(time);
        if (this.playing) {
            this.timestamp = performance.now();
            this.animationFrame = requestAnimationFrame(
                this.nextFrame.bind(this)
            );
        }
    }

    /**
     * The next fame is lazily calculated from previous frame state.
     * The timestamp is relative to previous timestamp and base time.
     * 
     * @private
     * @param {number} timeslice 
     * 
     * @memberOf SVGRenderService
     */
    private nextFrame(timestamp: number) {
        const timeslice = (timestamp - this.timestamp) / 1000;
        this.time += timeslice;
        this.timestamp = timestamp;
        for (const d of this.canvas) {
            d.frameUpdate(timeslice);
        }
        while (
            this.timelineIterator.hasNext() &&
            this.timelineIterator.peek().startTime < this.time
        ) {
            const d = this.timelineIterator.next();
            d.display(this.time);
        }
        this.animationFrame = requestAnimationFrame(
            this.nextFrame.bind(this)
        );
    }

    private onPlay(time: Seconds) {
        if (this.playing) return;
        this.playing = true;
        this.time = time;
        this.baseFrame();
    }

    private onPause(time: Seconds) {
        if (!this.playing) return;
        this.playing = false;
        this.time = time;
        if (this.animationFrame) {
            this.animationFrame = void cancelAnimationFrame(
                this.animationFrame
            );
        }
        this.baseFrame();
    }
}
