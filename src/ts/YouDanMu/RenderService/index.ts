import { Danmaku } from '../Danmaku';
import { Observer } from 'rxjs/Observer';

export interface Canvas {
    getDOM(): HTMLElement;
}

export interface RenderService {
    loadDanmaku(list: Danmaku[]): void;
}

export * from './SVGRenderService';
