import { Observable } from 'rxjs/Observable';

export type Seconds = number;

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
    video: Video;
    screen: Screen;
    
    onCue: Observable<Video>;
    onPlay: Observable<Seconds>;
    onPause: Observable<Seconds>;
    onSpeedChange: Observable<number>;
    onScreenInit: Observable<Screen>;
    onScreenResize: Observable<Screen>;
    onScreenDestroy: Observable<void>;
    onAdStart: Observable<void>;
    onAdEnd: Observable<void>;
}

export * from './YouTubeService';
