import { Danmaku } from '../../Danmaku';
import { SVGCanvas } from './SVGCanvas';
import { SVGDanmaku } from './SVGDanmaku';
import { Segments } from '../../util/Segments';

export class SVGDanmakuTop extends SVGDanmaku {
    /**
     * Time the Danmaku enters the canvas.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuTop
     */
    private entryTime: number;

    /**
     * Time the Danmaku leaves the canvas.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuTop
     */
    private leaveTime: number;

    /**
     * The canvas width. We need to save it since it might change
     * during the SVGDanmaku's lifecycle.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuTop
     */
    private canvasW: number;

    constructor(d: Danmaku, e: SVGTextElement, canvas: SVGCanvas) {
        super(d, e, canvas);

        // Calculate properties
        this.canvasW = canvas.width;
        this.entryTime = d.time;
        this.leaveTime = d.time + 5;
    }

    baseFrame(time: number): void {
        this.x = (this.canvasW - this.width) / 2;
    }

    nextFrame(time: number, timeslice: number): void {
        return void(0);
    }

    allocateY(s: Segments): void {
        this.y = s.take(this.height).end;
    }

    expire(time: number): boolean {
        return time < this.entryTime || time > this.leaveTime;
    }

    collide(d: SVGDanmakuTop): boolean {
        return (
            (d.entryTime >= this.entryTime &&
                d.entryTime < this.leaveTime) ||
            (this.entryTime >= d.entryTime &&
                this.entryTime < d.leaveTime)
        );
    }
}
