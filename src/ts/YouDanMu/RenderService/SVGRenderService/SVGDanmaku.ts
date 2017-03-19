import { Danmaku, Mode } from '../../Danmaku';
import { SVGCanvas } from './SVGCanvas';
import { Segments } from '../../util/Segments';

export abstract class SVGDanmaku {
    /**
     * The Danmaku meta data object.
     * 
     * @type {Danmaku}
     * @memberOf SVGDanmaku
     */
    d: Danmaku;

    /**
     * The SVG Text element.
     * 
     * @type {SVGTextElement}
     * @memberOf SVGDanmaku
     */
    e: SVGTextElement;

    /**
     * The designated canvas to draw onto.
     * 
     * @type {SVGCanvas}
     * @memberOf SVGDanmaku
     */
    canvas: SVGCanvas;

    /**
     * The designated layer index on the canvas.
     * 
     * @type {number}
     * @memberOf SVGDanmaku
     */
    layer: number;

    /**
     * SVG Text element width.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmaku
     */
    width: number;

    /**
     * SVG Text element height.
     * 
     * @private
     * @type {number}
     * @memberOf SVGDanmaku
     */
    height: number;

    /**
     * Time the Danmaku first draw on the canvas.
     * 
     * @type {number}
     * @memberOf SVGDanmaku
     */
    abstract startTime: number;

    /**
     * Time the Danmaku is cleared from the canvas.
     * 
     * @type {number}
     * @memberOf SVGDanmaku
     */
    abstract endTime: number;

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

    constructor(d: Danmaku, e: SVGTextElement, canvas: SVGCanvas) {
        this.d = d;
        this.e = e;
        this.canvas = canvas;
        this.layer = d.mode;
        this.measureWidthHeight();
    }

    /**
     * A common interface for all render object.
     * Get the SVG Text element.
     * 
     * @returns {SVGTextElement} 
     * 
     * @memberOf SVGDanmaku
     */
    getDOM(): SVGTextElement {
        return this.e;
    }

    /**
     * Called when first being drew on the canvas.
     * 
     * @param {number} time 
     * 
     * @memberOf SVGDanmaku
     */
    abstract baseFrame(time: number): void;

    /**
     * Called for consecutive frame updates.
     * 
     * @param {number} time 
     * @param {number} timeslice 
     * 
     * @memberOf SVGDanmaku
     */
    abstract nextFrame(time: number, timeslice: number): void;

    /**
     * Test if two Danmaku objects will collide in their lifecycle.
     * 
     * @abstract
     * @param {SVGDanmaku} d 
     * @returns {boolean} 
     * 
     * @memberOf SVGDanmaku
     */
    abstract collide(d: SVGDanmaku): boolean;

    /**
     * Called when first added to the canvas. Find an available space
     * from the given Segments structure, and assign its y value.
     * 
     * @abstract
     * @param {Segments} s 
     * 
     * @memberOf SVGDanmaku
     */
    abstract allocateY(s: Segments): void;

    /**
     * Test if the Danmaku object will expire at the given time.
     * 
     * @abstract
     * @param {number} time 
     * @returns {boolean} 
     * 
     * @memberOf SVGDanmaku
     */
    abstract expire(time: number): boolean;

    /**
     * Clone a SVG Text node and measure it inside the prepare area
     * on the canvas. Obtain its width and height.
     * 
     * @private
     * 
     * @memberOf SVGDanmaku
     */
    private measureWidthHeight() {
        const e = <SVGTextElement>this.e.cloneNode(true);
        this.canvas.prepare.appendChild(e);
        this.width = e.clientWidth;
        this.height = e.clientHeight;
        e.remove();
    }
}
