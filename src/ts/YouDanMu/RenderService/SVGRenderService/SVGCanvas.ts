import { Canvas } from '..';
import { SVGDanmaku } from './SVGDanmaku';

export class SVGCanvas implements Canvas, Iterable<SVGDanmaku> {
    parent: HTMLDivElement;
    layers: SVGElement[] = [];
    prepare: SVGElement;

    width: number;
    height: number;

    private danmakuSet = new Set<SVGDanmaku>();

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
        }
        this.parent.appendChild(this.prepare);
    }

    add(d: SVGDanmaku) {
        this.danmakuSet.add(d);
        this.layers[d.layer].appendChild(d.getDOM());
    }

    remove(d: SVGDanmaku) {
        this.danmakuSet.delete(d);
        this.layers[d.layer].removeChild(d.getDOM());
    }

    getDOM() {
        return this.parent;
    }

    clear() {
        for (let d of this.danmakuSet) {
            d.conceal();
        }
    }

    [Symbol.iterator](): Iterator<SVGDanmaku> {
        return this.danmakuSet[Symbol.iterator]();
    }
}
