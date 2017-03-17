import { Danmaku, Mode } from '../../Danmaku';
import { SVGCanvas } from './SVGCanvas';
import { SVGDanmakuTop } from './SVGDanmakuTop';
import { SVGDanmakuBottom } from './SVGDanmakuBottom';
import { SVGDanmakuMarquee } from './SVGDanmakuMarquee';
import { Segments } from '../../util/Segments';

export abstract class SVGDanmaku {
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
    static create(d: Danmaku, canvas: SVGCanvas): SVGDanmaku {
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
    abstract baseFrame(time: number);

    /**
     * Called for consecutive frame updates.
     * 
     * @param {number} time 
     * @param {number} timeslice 
     * 
     * @memberOf SVGDanmaku
     */
    abstract nextFrame(time: number, timeslice: number);

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
    abstract allocateY(s: Segments);

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
