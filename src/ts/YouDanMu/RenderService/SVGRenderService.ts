import { Subject } from 'rxjs/Subject';

import { RenderService } from '.';
import { Danmaku } from '../Danmaku';
import { Seconds } from '../VideoService';
import { IntervalTree } from '../util/IntervalTree';

class Canvas {
    e: SVGElement;

    get width(): number {
        return this.e.clientWidth;
    }

    get height(): number {
        return this.e.clientHeight;
    }

    clear() {
        while (this.e.firstChild) {
            this.e.removeChild(this.e.firstChild);
        }
    }
}

class DanmakuObject {
    d: Danmaku;
    e: SVGTextElement;

    width: number;
    height: number;

    canvas: Canvas;

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
    }

    get startTime(): Seconds {
        return this.d.time;
    }

    get endTime(): Seconds {
        return this.startTime + this.duration;
    }

    get duration(): Seconds {
        return this.canvas.width / this.speed;
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

    isDisplay(): boolean {
        return this.e.parentNode === this.canvas.e;
    }

    isDisplayAt(time: Seconds): boolean {
        return time > this.startTime && time < this.endTime;
    }

    display(time: Seconds) {
        this.x = this.canvas.width - time * this.speed;
        this.canvas.e.appendChild(this.e);
    }

    conceal() {
        this.e.remove();
    }

    frameUpdate(timeslice: Seconds) {
        this.x -= timeslice * this.speed;
    }
}

export class SVGRenderService implements RenderService {
    danmakuInput = new Subject<Danmaku>();
    playInput = new Subject<Seconds>();
    pauseInput = new Subject<Seconds>();

    private canvas: Canvas;
    private timeline = new IntervalTree();

    private playing = false;

    private time: Seconds;
    private timestamp: number = null;
    private animationFrame: number = null;

    constructor() {
        this.danmakuInput.subscribe(this.onDanmakuInput.bind(this));
    }

    private onDanmakuInput(danmaku: Danmaku) {
        const d = new DanmakuObject(danmaku, this.canvas);
        this.timeline.add(d, d.startTime, d.endTime);
        if (d.isDisplayAt(this.time))
            d.display(this.time);
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
        this.danmakuIterator = timeline.iterateFrom(time);
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
        for (const d in this.timeline.overlapAt(this.time)) {
            if (d.isDisplay()) {
                d.frameUpdate();
            } else {
                d.display(this.time);
            }
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
