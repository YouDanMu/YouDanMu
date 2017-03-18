import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toArray';

import { YouDanMu } from '../..';
import { RenderService } from '..';
import { SVGDanmaku } from './SVGDanmaku';
import { Danmaku, Mode } from '../../Danmaku';
import { Screen, Seconds, PlayerState, PlayerEvent } from '../../VideoService';
import { Timeline, TimelineNode, TimelineIterator } from '../../util';

import { SVGCanvas } from './SVGCanvas';

export class SVGRenderService implements RenderService {
    private canvas = new SVGCanvas(Mode._modeCount);
    private timeline: Timeline<Danmaku>;
    private timelineIterator: TimelineIterator<Danmaku>;

    private speed: BehaviorSubject<number>;
    private playerState: BehaviorSubject<PlayerState>;

    private time: Seconds;
    private timestamp: number;
    private animationFrame: number;

    private ydm: YouDanMu;

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.speed = ydm.videoService.speed;
        this.playerState = ydm.videoService.state;
        ydm.videoService.event.subscribe(e => this.onPlayerEvent(e));
    }

    loadDanmaku(list: Danmaku[]): void {
        const nodeArray = list.map(d => new TimelineNode(d.time, d));
        this.timeline = Timeline.createFromNodeArray(nodeArray);
    }

    private onPlayerEvent(event: PlayerEvent) {
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
            case PlayerEvent.Cue:
            case PlayerEvent.SpeedChange:
            default:
                break;
        }
    }

    private screenInit() {
        this.ydm.videoService.installCanvas(this.canvas);
        this.screenResize();
    }

    private screenResize() {
        const screen = this.ydm.videoService.screen.value;
        this.canvas.width = screen.width;
        this.canvas.height = screen.height;
    }

    private screenDestroy() {
        this.ydm.videoService.uninstallCanvas(this.canvas)
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
        this.canvas.baseFrame(time);
        this.timelineIterator = timeline.iterateFrom(time);
        if (this.playerState.value === PlayerState.Playing) {
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
        const timeslice = (timestamp - this.timestamp) * this.speed.value / 1000;
        this.time += timeslice;
        this.timestamp = timestamp;
        this.canvas.nextFrame(this.time, timeslice);
        const it = this.timelineIterator;
        while (it.hasNext() && it.peek().key < this.time) {
            const d = SVGDanmaku.create(it.next().value, this.canvas);
            this.canvas.add(d);
        }
        this.animationFrame = requestAnimationFrame(
            this.nextFrame.bind(this)
        );
    }

    /**
     * Resume the redering timer and animation.
     * 
     * @private
     * 
     * @memberOf SVGRenderService
     */
    private play() {
        this.time = this.ydm.videoService.getTime();
        this.baseFrame();
    }

    /**
     * Pause the redering timer and animation.
     * 
     * @private
     * 
     * @memberOf SVGRenderService
     */
    private pause() {
        this.time = this.ydm.videoService.getTime();
        if (this.animationFrame) {
            this.animationFrame = void cancelAnimationFrame(
                this.animationFrame
            );
        }
        this.baseFrame();
    }
}
