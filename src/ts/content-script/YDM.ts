import { Danmaku } from './Danmaku';
import { Segment, Segments } from './Segments';

export class YDM {
    static PlayerState = {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    };

    moviePlayer: HTMLElement;
    overlay: SVGElement;
    prepare: SVGElement;
    player: any;
    state = YDM.PlayerState.UNSTARTED;
    danmaku: {[key:string]: Danmaku[]} = {
        [Danmaku.MODE.TOP]: [],
        [Danmaku.MODE.BOTTOM]: [],
        [Danmaku.MODE.MARQUEE]: []
    };
    segments: {[key:string]: Segments} = {
        [Danmaku.MODE.TOP]: null,
        [Danmaku.MODE.BOTTOM]: null,
        [Danmaku.MODE.MARQUEE]: null
    };
    settings: {[key:string]: any} = {
        'duration': 5000, // in millisecond
        'speed': 1,
    };

    resumeTimeVideo: number;
    resumeTimeFrame: number;

    constructor() {
        this.prepare = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.prepare.id = 'ydm-prepare';
        this.overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.overlay.id = 'ydm-overlay';
        document.addEventListener('DOMContentLoaded', (...args: any[]) => {
            this.log('DOMContentLoaded');
            this.hijectLoadFunction();
            this.hijectYouTubePlayerReady();
        });
    }

    log(msg?: any, ...args: any[]) {
        console.log(msg, ...args);
    }

    init() {
        this.log('YDM.init');
        this.moviePlayer = document.getElementById('movie_player');
        if (document.getElementById('ydm-overlay') != null
            || document.getElementById('movie_player') == null) return;
        this.moviePlayer.appendChild(this.overlay);
        this.moviePlayer.appendChild(this.prepare);
        let s = new Segment(0, this.moviePlayer.offsetHeight);
        this.segments[Danmaku.MODE.TOP] = new Segments(s);
        this.segments[Danmaku.MODE.BOTTOM] = new Segments(s);
        this.segments[Danmaku.MODE.MARQUEE] = new Segments(s);
    }

    addDanmaku(d: Danmaku) {
        let segments = this.segments[d.mode];
        let pWidth = this.moviePlayer.offsetWidth;
        this.prepare.appendChild(d.e);
        switch (d.mode) {
            case Danmaku.MODE.TOP:
            case Danmaku.MODE.BOTTOM: {
                d.x = (pWidth-d.width)/2;
                break;
            }
            case Danmaku.MODE.MARQUEE: {
                d.x = pWidth;
                break;
            }
        }
        switch (d.mode) {
            case Danmaku.MODE.TOP:
            case Danmaku.MODE.MARQUEE: {
                let s = segments.findFirst(d.height);
                if (!s) {
                    this.danmaku[d.mode].forEach((x)=>x.occupying = false);
                    segments.reset();
                    s = segments.findFirst(d.height);
                }
                segments.subtract(s);
                d.y = s.end;
                break;
            }
            case Danmaku.MODE.BOTTOM: {
                let s = segments.findLast(d.height);
                if (!s) {
                    this.danmaku[d.mode].forEach((x)=>x.occupying = false);
                    segments.reset();
                    s = segments.findLast(d.height);
                }
                segments.subtract(s);
                d.y = s.end;
                break;
            }
        }
        d.occupying = true;
        this.overlay.appendChild(d.e);
        this.danmaku[d.mode].push(d);
    }

    animationFrame(timestamp: number) {
        if (this.state !== YDM.PlayerState.PLAYING) {
            this.resumeTimeFrame = null;
            this.resumeTimeVideo = null;
            return;
        }
        if (this.resumeTimeFrame == null)
            this.resumeTimeFrame = timestamp;
        if (this.resumeTimeVideo == null)
            this.resumeTimeVideo = this.currentTime;
        let time = timestamp - this.resumeTimeFrame + this.resumeTimeVideo;
        let duration = this.settings['duration'] / this.settings['speed'];
        let pWidth = this.moviePlayer.offsetWidth;
        Object.keys(this.danmaku).forEach((mode) => {
            let segments = this.segments[mode];
            this.danmaku[mode] = this.danmaku[mode].filter((d) => {
                let elapsed = time - d.time;
                if (elapsed >= duration) {
                    if (d.occupying &&
                       (mode === Danmaku.MODE.BOTTOM ||
                        mode === Danmaku.MODE.TOP)) {
                        d.occupying = false;
                        segments.add(d.ySegment);
                    }
                    d.e.remove();
                    return false;
                }
                if (mode === Danmaku.MODE.MARQUEE) {
                    d.x = pWidth - ((pWidth+d.width)*elapsed/duration);
                    if (d.occupying && d.x + d.width < pWidth) {
                        d.occupying = false;
                        segments.add(d.ySegment);
                    }
                }
                return true;
            });
        });
        requestAnimationFrame(this.animationFrame.bind(this));
    }

    pause() {
        
    }

    resume() {
        requestAnimationFrame(this.animationFrame.bind(this));
    }

    cue() {
        let overlay = this.overlay;
        while(overlay && overlay.firstChild) {
            overlay.removeChild(overlay.firstChild);
        }
    }

    get currentTime(): number {
        return this.player.getCurrentTime() * 1000;
    }

    hijectLoadFunction() {
        if ((<any>window).ytplayer == null) {
            setTimeout(() => this.hijectLoadFunction(), 0);
            return;
        }
        let oldLoad = (<any>window).ytplayer.load;
        (<any>window).ytplayer.load = (...args: any[]) => {
            this.log('ytplayer.load', ...args);
            if (typeof oldLoad === 'function') return oldLoad();
        };
        if ((<any>window).ytplayer.config.args.video_id != null) {
            this.init();
            this.resume();
        }
    }

    hijectYouTubePlayerReady() {
        let oldReady = (<any>window).onYouTubePlayerReady;
        (<any>window).onYouTubePlayerReady = (player: any, ...args: any[]) => {
            this.onYouTubePlayerReady(player);
            if (typeof oldReady == 'function')
                return oldReady(player, ...args);
        };
    }

    onYouTubePlayerReady(player: any) {
        this.log('onYouTubePlayerReady:', player);
        this.player = player;
        player.addEventListener('onStateChange', (state: number) => {
            this.log('onStateChange:', state);
            this.state = state;
            switch (state) {
                case YDM.PlayerState.PLAYING:
                    let d = new Danmaku();
                    d.text = '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈';
                    d.time = this.currentTime;
                    d.mode = Danmaku.MODE.MARQUEE;
                    d.size = 25;
                    d.color = '#FFFFFF';
                    this.addDanmaku(d);
                    d = new Danmaku();
                    d.text = '啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊';
                    d.time = this.currentTime;
                    d.mode = Danmaku.MODE.TOP;
                    d.size = 25;
                    d.color = '#FF3333';
                    this.addDanmaku(d);
                    d = new Danmaku();
                    d.text = '呵呵呵呵呵呵呵呵呵呵呵呵呵呵呵';
                    d.time = this.currentTime;
                    d.mode = Danmaku.MODE.BOTTOM;
                    d.size = 25;
                    d.color = '#3333FF';
                    this.addDanmaku(d);
                    // this.init();
                    this.resume();
                    break;
                case YDM.PlayerState.PAUSED:
                    this.pause();
                    break;
                case YDM.PlayerState.CUED:
                    this.init();
                    this.cue();
                    break;
            }
        });
        player.addEventListener('onPlaybackRateChange', (rate: number) => {
            this.log('onPlaybackRateChange:', rate);
        });
    }

}
