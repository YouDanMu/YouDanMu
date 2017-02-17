declare interface YDMStubs {
    ydm: YDM;
    dProvider: DanmakuProvider;
    vProvider: VideoProvider;
    extension: BrowserExtension;
    dTimeline: DanmakuTimeline;
    danmaku: Danmaku;

}

declare var stubs: YDMStubs; 
export declare class YDM {

    constructor();

    onVideoScreenCreated(): void;
    onVideoScreenDestoryed(): void;
    onVideoScreenResized(): void;

    onVideoCued(): void;
    onVideoPlayed(): void;
    onVideoPaused(): void;
    onVideoSeeked(): void;
    onVideoSpeedChanged(): void;
}

declare enum Mode {
    TOP,
    BOTTOM,
    MARQUEE
}

declare interface Default {
    mode: Mode;
    size: number;
    color: string;
    opacity: number;
    padding: number;
    sizeRatio: number;
    fontFamily: string;
    textShadow: string;
}

declare class Danmaku {
    mode : Mode;
    private default: Default;
    
    time: number; // in millisecond

    create: Date;
    pool: string;
    user: string;
    id: string;
    e: SVGTextElement;
    sizeRatio: number;
    occupying: boolean;


    constructor(text?: string, time?: number, mode?: string);

    text() : string;
    text(value: string): void;


}


declare class DanmakuTimeline {
    private TimeLine: Danmaku[];
    private currentTime: number;

    constructor();

    setDanmakus(input: Danmaku[]): void;
    seek(time: number): void;
    setSpeed(speed: number): void;
    play(): void;
    pause(): void;


    private tick(); 
}

declare interface PlayerState {
    UNSTARTED: string,
    ENDED: string,
    PLAYING: string,
    PAUSED: string,
    BUFFERING: string,
    CUED: string
}

declare interface VideoProvider {

    ydm: YDM;
    //constructor(ydm: YDM);

}

declare class DanmakuProvider {
    getDanmakuByID(id: string, callback: (result: Danmaku[]) => void): void;
}

declare interface BrowserExtension {

}


