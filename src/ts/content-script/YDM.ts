import { Danmaku } from './Danmaku';

export class YDM {
    static PlayerState = {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5
    };

    dom: {[key:string]: HTMLElement} = {};

    constructor() {
        document.addEventListener('DOMContentLoaded', (...args: any[]) => {
            this.log('DOMContentLoaded');
            this.hijectLoadFunction();
            let oldReady = (<any>window).onYouTubePlayerReady;
            (<any>window).onYouTubePlayerReady = (player: any) => {
                this.log('onYouTubePlayerReady:', player);
                (<any>window).player = player;
                player.addEventListener('onStateChange', (state: number) => {
                    this.log('onStateChange:', state);
                    switch (state) {
                        case YDM.PlayerState.PLAYING:
                            this.init();
                            this.randomResume();
                            break;
                        case YDM.PlayerState.PAUSED:
                            this.randomPause();
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
                if (typeof oldReady == 'function') {
                    return oldReady(...args);
                }
            };
        });
    }

    log(msg?: any, ...args: any[]) {
        console.log(msg, ...args);
    }

    init() {
        this.log('YDM.init');
        var overlay = document.getElementById('ydm-overlay');
        var movie_player = document.getElementById('movie_player');
        if (overlay != null || movie_player == null) return;
        this.dom['movie_player'] = movie_player;
        overlay = this.dom['overlay'] = document.createElement('div');
        overlay.id = 'ydm-overlay';
        movie_player.appendChild(overlay);
    }

    addDanmaku(danmaku: Danmaku) {
        let e = document.createElement('div');
        e.classList.add('ydm-danmaku');
        e.style.top = danmaku.position;
        var hiddenText = document.createElement('span');
        hiddenText.classList.add('ydm-danmaku-hidden-text');
        hiddenText.innerText = danmaku.text;
        var displayText = document.createElement('span');
        displayText.classList.add('ydm-danmaku-text');
        displayText.innerText = danmaku.text;
        e.appendChild(hiddenText);
        e.appendChild(displayText);
        e.addEventListener('animationend', function() {this.remove()}, false);
        this.dom['overlay'].appendChild(e);
    }

    pause() {
        this.dom['overlay'].classList.add('paused');
    }

    resume() {
        this.dom['overlay'].classList.remove('paused');
    }

    cue() {
        let overlay = this.dom['overlay'];
        while(overlay.firstChild) {
            overlay.removeChild(overlay.firstChild);
        }
    }

    randomInterval: number = null;

    randomInt(min: number, max:number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomAddDanmaku() {
        let danmaku = new Danmaku();
        danmaku.text = '哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈';
        danmaku.position = this.randomInt(0,90).toString() + '%';
        this.addDanmaku(danmaku);
    }

    randomResume() {
        if (this.randomInterval != null) return;
        this.resume();
        this.randomInterval = setInterval(() => this.randomAddDanmaku(), 1000);
    }

    randomPause() {
        if (this.randomInterval == null) return;
        clearInterval(this.randomInterval);
        this.pause();
        this.randomInterval = null;
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
            this.randomResume();
        }
    }

}
