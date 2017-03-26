import { Danmaku } from '../Danmaku';
import { Observer } from 'rxjs/Observer';

export interface Canvas {
    getDOM(): HTMLElement;
}

export interface RenderService {
    addDanmaku: (d: Danmaku) => void;
    clearDanmaku: () => void;
}

export * from './SVGRenderService';
