import {Segment, Segments} from './Segments';

function RRGGBB(color: number): string {
    let t = Number(color).toString(16).toUpperCase();
    return '#' + (Array(7).join('0') + t).slice(-6);
};

export class Danmaku {
    static MODE = {
        TOP: 'TOP',
        BOTTOM: 'BOTTOM',
        MARQUEE: 'MARQUEE'
    };

    static defaults = {
        mode: Danmaku.MODE.MARQUEE,
        size: 25,
        color: '#FFFFFF',
        opacity: 1,
        padding: 2,
        sizeRatio: 1,
        fontFamily: 'SimHei, "Microsoft JhengHei", Arial, Helvetica, sans-serif',
        textShadow: 'black 1px 0px 1px, black 0px 1px 1px, black 0px -1px 1px, black -1px 0px 1px'
    };

    time: number; // in millisecond
    mode: string;
    create: Date;
    pool: string;
    user: string;
    id: string;
    e: SVGTextElement;
    sizeRatio: number;
    occupying: boolean;

    constructor(text?: string, time?: number, mode?: string) {
        this.e = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        if (text) this.text = text;
        if (time) this.time = time;
        this.mode = mode || Danmaku.defaults.mode;
        this.sizeRatio = Danmaku.defaults.sizeRatio;
        this.fontFamily = Danmaku.defaults.fontFamily;
        this.textShadow = Danmaku.defaults.textShadow;
        this.size = Danmaku.defaults.size;
        this.color = Danmaku.defaults.color;
        this.padding = Danmaku.defaults.padding;
        this.opacity = Danmaku.defaults.opacity;
    }

    set text(text: string) {
        this.e.textContent = text;
    }

    set size(size: number) {
        this.e.style.fontSize = (size * this.sizeRatio).toString() + 'px';
    }

    set color(color: number | string) {
        if (typeof color === 'number')
            color = RRGGBB(color);
        this.e.style.fill = color;
    }

    set opacity(opacity: number) {
        this.e.style.opacity = opacity.toString();
    }

    set fontFamily(fm: string) {
        this.e.style.fontFamily = fm;
    }

    set textShadow(ts: string) {
        this.e.style.textShadow = ts;
    }

    set padding(p: number | string) {
        if (typeof p === 'number') p = p.toString() + 'px';
        this.e.style.padding = p;
    }

    set x(x: number | string) {
        this.e.setAttribute('x', x.toString());
    }

    get x(): number | string {
        return Number(this.e.getAttribute('x'));
    }

    set y(y: number | string) {
        this.e.setAttribute('y', y.toString());
    }

    get y(): number | string {
        return Number(this.e.getAttribute('y'));
    }

    get width(): number {
        return this.e.clientWidth;
    }

    get height(): number {
        return this.e.clientHeight;
    }

    get ySegment(): Segment {
        let len = this.height;
        let end = Number(this.e.getAttribute('y'));
        let r = new Segment(end - len, end);
        return r;
    }

    static parseBilibili(n: Element): Danmaku {
        let info = n.getAttribute('p').split(',');
        let d = new Danmaku(
            n.textContent,
            Number(info[0]) * 1000,
            [   undefined,
                Danmaku.MODE.MARQUEE,
                Danmaku.MODE.MARQUEE,
                Danmaku.MODE.MARQUEE,
                Danmaku.MODE.BOTTOM,
                Danmaku.MODE.TOP
            ][Number(info[1])]
        );
        d.size = Number(info[2]);
        d.color = Number(info[3]);
        d.create = new Date(Number(info[4]));
        d.pool = info[5];
        d.user = info[6];
        d.id = info[7];
        return d;
    }
}

(<any>window).Danmaku = Danmaku;
