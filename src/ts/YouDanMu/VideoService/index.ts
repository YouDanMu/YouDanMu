import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Canvas } from '../RenderService';

export type Seconds = number;

export enum PlayerState {
    Idel,
    Cued,
    ScreenInit,
    Ready,
    Playing,
    AdPlaying
}

export interface Video {
    id: string;
    url: string;
    title: string;
    service: string;
    duration: Seconds;
}

export interface Screen {
    e?: HTMLElement;
    width: number;
    height: number;
    fullscreen?: boolean;
}

export interface VideoService {
    state: BehaviorSubject<PlayerState>;
    screen: BehaviorSubject<Screen>;
    video: BehaviorSubject<Video>;
    speed: BehaviorSubject<number>;

    installCanvas(canvas: Canvas);
    uninstallCanvas(canvas: Canvas);

    getTime(): number;
}

export * from './YouTubeVideoService';
