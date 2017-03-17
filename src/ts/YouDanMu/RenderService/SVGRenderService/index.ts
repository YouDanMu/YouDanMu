import Color from 'color';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toArray';

import { YouDanMu } from '../..';
import { RenderService } from '..';
import { Danmaku, Mode } from '../../Danmaku';
import { Screen, Seconds } from '../../VideoService';
import { Timeline, TimelineNode, TimelineIterator } from '../../util/Timeline';

import { SVGCanvas } from './SVGCanvas';

export class SVGRenderService implements RenderService {
    danmakuInput = new Subject<Danmaku>();

    private canvas = new SVGCanvas(Mode._modeCount);
    private timeline: Timeline<Danmaku>;
    private timelineIterator: TimelineIterator<Danmaku>;

    private playing: boolean;

    private time: Seconds;
    private timestamp: number;
    private animationFrame: number;

    private ydm: YouDanMu;

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.danmakuInput.toArray().subscribe(list => this.onDanmakuInput(list));
        ydm.videoService.onPlay.subscribe(p => this.onPlay(p));
        ydm.videoService.onScreenInit.subscribe(s => this.onScreenInit(s));
        ydm.videoService.onScreenResize.subscribe(s => this.onScreenResize(s));
        ydm.videoService.onScreenDestroy.subscribe(() => this.onScreenDestroy());
    }

    private onDanmakuInput(list: Danmaku[]) {
        const nodeArray = list.map(d => new TimelineNode(d.time, d));
        this.timeline = Timeline.createFromNodeArray(nodeArray);
    }

    private onScreenInit(screen: Screen) {
        this.ydm.videoService.installCanvas(this.canvas);
        this.onScreenResize(screen);
    }

    private onScreenResize(screen: Screen) {
        this.canvas.width = screen.width;
        this.canvas.height = screen.height;
    }

    private onScreenDestroy() {
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
        this.canvas.clear();
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
            // Animate the object.
            // If duration expires, remove it.
            d.frameUpdate(timeslice);
        }
        const it = this.timelineIterator;
        while (it.hasNext() && it.peek().startTime < this.time) {
            const d = new DanmakuObject(it.next(), this.canvas);
            d.display(this.time);
        }
        this.animationFrame = requestAnimationFrame(
            this.nextFrame.bind(this)
        );
    }

    /**
     * Play or pause the redering timer and animation.
     * 
     * @private
     * @param {boolean} playing 
     * @returns 
     * 
     * @memberOf SVGRenderService
     */
    private onPlay(playing: boolean) {
        if (this.playing === playing) return;
        this.playing = playing;
        this.time = this.ydm.videoService.getTime();
        if (this.animationFrame) {
            this.animationFrame = void cancelAnimationFrame(
                this.animationFrame
            );
        }
        this.baseFrame();
    }
}
