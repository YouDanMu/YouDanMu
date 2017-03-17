import { Color } from 'color';

export enum Mode {
    MARQUEE = 0,
    TOP,
    BOTTOM,
    _modeCount
}

/**
 * The very basic Danmaku object that is common to most of the Danmaku
 * services.
 * 
 * @export
 * @interface Danmaku
 */
export interface Danmaku {
    /**
     * The comment content.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    text: string;
    /**
     * The entry satrt time in seconds relative to the video.
     * 
     * @type {number}
     * @memberOf Danmaku
     */
    time: number;
    /**
     * Danmaku display mode.
     * 
     * @type {Mode}
     * @memberOf Danmaku
     */
    mode: Mode;
    /**
     * The font size in CSS string.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    size: string;
    /**
     * The text color.
     * 
     * @type {Color}
     * @memberOf Danmaku
     */
    color: Color;
}
