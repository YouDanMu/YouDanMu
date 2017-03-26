import { Canvas } from '..';
import { SVGDanmaku } from './SVGDanmaku';
import { Segments } from '../../util/Segments';

export class SVGCanvas implements Canvas {
    parent: HTMLDivElement;
    layers: SVGElement[] = [];
    prepare: SVGElement;

    width: number;
    height: number;

    private time: number;
    private list: Set<SVGDanmaku>[] = [];
    private _tmpCssDisplay: string;

    constructor(layers: number) {
        this.parent = document.createElement('div');
        this.prepare = document.createElementNS(
            'http://www.w3.org/2000/svg', 'svg');
        this.parent.classList.add('ydm-svg-canvas');
        this.prepare.classList.add('ydm-svg-canvas-prepare');
        for (let i = 0; i < layers; i++) {
            const layer = document.createElementNS(
                'http://www.w3.org/2000/svg', 'svg');
            layer.classList.add('ydm-svg-canvas-layer');
            this.layers.push(layer);
            this.parent.appendChild(layer);
            this.list.push(new Set<SVGDanmaku>());
        }
        this.parent.appendChild(this.prepare);
    }

    add(d: SVGDanmaku) {
        const s = new Segments(0, this.height);
        this.list[d.layer].forEach((x) => {
            if (d.collide(x)) s.ref(x.y - x.height, x.y);
        });
        d.allocateY(s);
        d.baseFrame(this.time);
        this.list[d.layer].add(d);
        this.layers[d.layer].appendChild(d.getDOM());
    }

    remove(d: SVGDanmaku) {
        this.list[d.layer].delete(d);
        this.layers[d.layer].removeChild(d.getDOM());
    }

    getDOM() {
        return this.parent;
    }

    clear() {
        this.list.forEach(l => l.forEach(d => this.remove(d)));
    }

    baseFrame(time: number) {
        this.time = time;
        this.clear();
    }

    nextFrame(time: number, timeslice: number) {
        this.time = time;
        this.list.forEach(l =>
            l.forEach(d => {
                if (d.expire(time)) this.remove(d);
                else d.nextFrame(time, timeslice);
            }));
    }

    show() {
        this.parent.style.display = this._tmpCssDisplay;
    }

    hide() {
        this._tmpCssDisplay = this.parent.style.display;
        this.parent.style.display = 'none';
    }

    setOpacity(opacity: number) {
        this.parent.style.opacity = opacity.toString();
    }
}
