export enum Mode {
    MARQUEE = 0,
    TOP,
    BOTTOM,
    _modeCount
}

/**
 * The very basic Danmaku object that is common to most of the Danmaku
 * services. Extra fields and attributes can be added into a Map.
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
     * The entry satrt time relative to the video.
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
     * The text color in CSS string.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    color: string;
    /**
     * The opacity in CSS string.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    opacity: string;
    /**
     * The font family in CSS string.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    font: string;
    /**
     * The text shadow in CSS string.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    shadow: string;
    /**
     * The padding around the text in CSS string.
     * 
     * @type {string}
     * @memberOf Danmaku
     */
    padding: string;
    /**
     * Extra fields for Danmaku service, and render service specifics.
     * 
     * @type {Map<string,any>}
     * @memberOf Danmaku
     */
    extra: Map<string,any>;
}
