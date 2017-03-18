import { Danmaku } from '../../Danmaku';
import { SVGCanvas } from './SVGCanvas';
import { SVGDanmaku } from './SVGDanmaku';
import { Segments } from '../../util/Segments';

export class SVGDanmakuMarquee extends SVGDanmaku {
    /**
     * Moving speed, px/second.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuMarquee
     */
    private speed: number;

    /**
     * Time the Danmaku starts entering the canvas.
     *        |-----------------------------------|
     *        |               Canvas              |Danmaku
     *        |-----------------------------------|
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuMarquee
     */
    private beginEntryTime: number;

    /**
     * Time the Danmaku fully entered the canvas.
     *        |-----------------------------------|
     *        |               Canvas       Danmaku|
     *        |-----------------------------------|
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuMarquee
     */
    private fullyEntryTime: number;

    /**
     * Time the Danmaku starts leaving the canvas.
     *        |-----------------------------------|
     *        |Danmaku        Canvas              |
     *        |-----------------------------------|
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuMarquee
     */
    private beginLeaveTime: number;

    /**
     * Time the Danmaku fully left the canvas.
     *        |-----------------------------------|
     * Danmaku|               Canvas              |
     *        |-----------------------------------|
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuMarquee
     */
    private fullyLeaveTime: number;

    /**
     * The canvas width. We need to save it since it might change
     * during the SVGDanmaku's lifecycle.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuMarquee
     */
    private canvasW: number;

    constructor(d: Danmaku, e: SVGTextElement, canvas: SVGCanvas) {
        super(d, e, canvas);

        // Calculate properties
        this.canvasW = canvas.width;
        this.speed = 0.22 * this.width + 113.78;
        this.beginEntryTime = d.time;
        this.fullyEntryTime = d.time + (this.width / this.speed);
        this.beginLeaveTime = d.time + (canvas.width / this.speed);
        this.fullyLeaveTime = d.time + ((this.width + canvas.width) / this.speed);
    }

    baseFrame(time: number) {
        this.x = this.canvasW - (this.beginEntryTime - time) * this.speed;
    }

    nextFrame(time: number, timeslice: number) {
        this.x -= timeslice * this.speed;
    }

    allocateY(s: Segments) {
        this.y = s.take(this.height).end;
    }

    expire(time: number): boolean {
        return time < this.beginEntryTime || time > this.fullyLeaveTime;
    }

    collide(d: SVGDanmakuMarquee): boolean {
        return (
            (d.beginEntryTime >= this.beginEntryTime &&
                d.beginEntryTime < this.fullyEntryTime) ||
            (this.beginEntryTime >= d.beginEntryTime &&
                this.beginEntryTime < d.fullyEntryTime) ||
            (d.beginLeaveTime >= this.beginLeaveTime &&
                d.beginLeaveTime < this.fullyLeaveTime) ||
            (this.beginLeaveTime >= d.beginLeaveTime &&
                this.beginLeaveTime < d.fullyLeaveTime)
        );
    }
}
