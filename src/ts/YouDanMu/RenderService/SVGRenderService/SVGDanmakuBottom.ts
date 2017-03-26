import { Danmaku } from '../../Danmaku';
import { SVGCanvas } from './SVGCanvas';
import { SVGDanmaku } from './SVGDanmaku';
import { Segments } from '../../util/Segments';

export class SVGDanmakuBottom extends SVGDanmaku {
    /**
     * Time the Danmaku first draw on the canvas.
     * 
     * @type {number}
     * @memberOf SVGDanmaku
     */
    startTime: number;

    /**
     * Time the Danmaku is cleared from the canvas.
     * 
     * @type {number}
     * @memberOf SVGDanmaku
     */
    endTime: number;

    /**
     * The canvas width. We need to save it since it might change
     * during the SVGDanmaku's lifecycle.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmakuBottom
     */
    private canvasW: number;

    constructor(d: Danmaku, e: SVGTextElement, canvas: SVGCanvas) {
        super(d, e, canvas);

        // Calculate properties
        this.canvasW = canvas.width;
        this.startTime = d.time;
        this.endTime = d.time + 5;
    }

    get y(): number {
        return parseFloat(this.e.getAttribute('y')) + 8;
    }

    set y(y: number) {
        this.e.setAttribute('y', (y - 8).toString());
    }

    baseFrame(time: number): void {
        this.x = (this.canvasW - this.width) / 2;
    }

    nextFrame(time: number, timeslice: number): void {
        return void (0);
    }

    allocateY(s: Segments): void {
        this.y = s.take(this.height, true).end;
    }

    expire(time: number): boolean {
        return time < this.startTime || time > this.endTime;
    }

    collide(d: SVGDanmakuBottom): boolean {
        return (
            (d.startTime >= this.startTime &&
                d.startTime < this.endTime) ||
            (this.startTime >= d.startTime &&
                this.startTime < d.endTime)
        );
    }
}
