import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toArray';

import { YouDanMu } from '../..';
import { RenderService } from '..';
import { SVGDanmaku } from './SVGDanmaku';
import { SVGDanmakuTop } from './SVGDanmakuTop';
import { SVGDanmakuBottom } from './SVGDanmakuBottom';
import { SVGDanmakuMarquee } from './SVGDanmakuMarquee';
import { Danmaku, Mode } from '../../Danmaku';
import { Screen, Seconds, PlayerState, PlayerEvent } from '../../VideoService';
import { IntervalTree, IntervalNode, IntervalTreeIterator } from '../../util';

import { SVGCanvas } from './SVGCanvas';

/**
 * Create a SVGDanmaku.
 * 
 * @static
 * @param {Danmaku} d 
 * @param {SVGCanvas} canvas 
 * @returns {SVGDanmaku} 
 * 
 * @memberOf SVGDanmaku
 */
function createSVGDanmaku(d: Danmaku, canvas: SVGCanvas): SVGDanmaku {
    const e = document.createElementNS(
        'http://www.w3.org/2000/svg', 'text');
    e.classList.add('ydn-svg-danmaku');
    e.textContent = d.text;
    e.style.fontSize = d.size;
    e.style.fill = d.color.string();
    // TODO: apply defaults
    if (d.color.dark()) {
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
    switch (d.mode) {
        case Mode.TOP:
            return new SVGDanmakuTop(d, e, canvas);
        case Mode.BOTTOM:
            return new SVGDanmakuBottom(d, e, canvas);
        case Mode.MARQUEE:
            return new SVGDanmakuMarquee(d, e, canvas);
        default:
            throw new Error('Unknown Danmaku mode.');
    }
}

export class SVGRenderService implements RenderService {
    private canvas = new SVGCanvas(Mode._modeCount);
    private timeline = new IntervalTree<SVGDanmaku>();
    private timelineIterator: IntervalTreeIterator<SVGDanmaku>;

    private speed: BehaviorSubject<number>;
    private playerState: BehaviorSubject<PlayerState>;

    private time: Seconds;
    private timestamp: number;
    private animationFrame: number;

    private ydm: YouDanMu;

    get isPlaying(): boolean {
        return this.playerState.value === PlayerState.Playing;
    }

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.speed = ydm.videoService.speed;
        this.playerState = ydm.videoService.state;
        ydm.videoService.event.subscribe(e => this.onPlayerEvent(e));
    }

    addDanmaku = (d: Danmaku): void => {
        const svgd = createSVGDanmaku(d, this.canvas);
        this.timeline.insert(svgd.startTime, svgd.endTime, svgd)
        if (this.isPlaying) {
            this.timelineIterator = this.timeline.iterateFrom(this.time);
        }
    }

    clearDanmaku = (): void => {
        if (this.isPlaying) {
            this.pause();
        }
        this.canvas.clear();
        this.uncue();
        this.time = this.ydm.videoService.getTime();
        this.baseFrame();
    }

    private onPlayerEvent(event: PlayerEvent): void {
        switch (event) {
            case PlayerEvent.Play:
                this.play();
                break;
            case PlayerEvent.Pause:
                this.pause();
                break;
            case PlayerEvent.AdPlay:
                this.canvas.hide();
                break;
            case PlayerEvent.AdPause:
                this.canvas.show();
                break;
            case PlayerEvent.ScreenInit:
                this.screenInit();
                break;
            case PlayerEvent.ScreenResize:
                this.screenResize();
                break;
            case PlayerEvent.ScreenDestroy:
                this.screenDestroy();
                break;
            case PlayerEvent.Uncue:
                this.uncue();
                break;
            case PlayerEvent.SpeedChange:
            default:
                break;
        }
    }

    private screenInit(): void {
        this.ydm.videoService.installCanvas(this.canvas);
        this.screenResize();
    }

    private screenResize(): void {
        const screen = this.ydm.videoService.screen.value;
        if (
            this.canvas.width !== screen.width ||
            this.canvas.height !== screen.height
        ) {
            this.canvas.width = screen.width;
            this.canvas.height = screen.height;
            this.rebuildTimeline();
        }
    }

    private screenDestroy(): void {
        this.ydm.videoService.uninstallCanvas(this.canvas)
    }

    private rebuildTimeline() {
        if (this.isPlaying) {
            this.pause();
        }
        const it = this.timeline.iterate();
        this.timeline = new IntervalTree<SVGDanmaku>();
        while (it.hasNext()) {
            it.next().values.forEach(d => {
                const svgd = createSVGDanmaku(d.d, this.canvas);
                this.timeline.insert(svgd.startTime, svgd.endTime, svgd);
            });
        }
        // BUG: baseFrame not drawn if not playing
        /*
        if (this.isPlaying) {
            this.time = this.ydm.videoService.getTime();
            this.baseFrame();
        }
        */
        this.time = this.ydm.videoService.getTime();
        this.baseFrame();
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
    private baseFrame(): void {
        const { timeline, time } = this;
        this.canvas.baseFrame(time);
        this.timeline.searchPoint(time).forEach(i => {
            i.values.forEach(d => {
                this.canvas.add(d);
            });
        });
        this.timelineIterator = timeline.iterateFrom(time);
        this.timestamp = performance.now();
        this.animationFrame = requestAnimationFrame(
            this.nextFrame.bind(this)
        );
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
    private nextFrame(timestamp: number): void {
        const timeslice = (timestamp - this.timestamp) * this.speed.value / 1000;
        this.time += timeslice;
        this.timestamp = timestamp;
        this.canvas.nextFrame(this.time, timeslice);
        const it = this.timelineIterator;
        while (it.hasNext() && it.peek().start <= this.time) {
            it.next().values.forEach(d => this.canvas.add(d));
        }
        if (this.isPlaying) {
            this.animationFrame = requestAnimationFrame(
                this.nextFrame.bind(this)
            );
        }
    }

    /**
     * Resume the redering timer and animation.
     * 
     * @private
     * 
     * @memberOf SVGRenderService
     */
    private play(): void {
        const { time, timeline } = this;
        this.time = this.ydm.videoService.getTime();
        if (time && Math.abs(time - this.time) > 0.1) {
            // Seeked to a distant frame
            this.baseFrame();
        } else {
            // Probably resumed from pause
            this.timelineIterator = timeline.iterateFrom(this.time);
            this.timestamp = performance.now();
            this.animationFrame = requestAnimationFrame(
                this.nextFrame.bind(this)
            );
        }
    }

    /**
     * Pause the redering timer and animation.
     * 
     * @private
     * 
     * @memberOf SVGRenderService
     */
    private pause(): void {
        if (this.animationFrame) {
            this.animationFrame = void cancelAnimationFrame(
                this.animationFrame
            );
        }
    }

    private uncue(): void {
        this.timeline = new IntervalTree<SVGDanmaku>();
        this.timelineIterator = null;
    }
}
