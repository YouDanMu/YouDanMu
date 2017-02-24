/// <reference path="../../typings/YouTube.d.ts" />

import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/operator/multicast';

import { Seconds, Video, Screen, VideoService } from './';

enum State {
    UNSTARTED = -1,
    ENDED,
    PLAYING,
    PAUSED,
    BUFFERING,
    UNDEFINED,
    CUED
}

interface ScreenSize {
    width: number;
    height: number;
}

export class YouTubeService implements VideoService {
    video: Video;
    screen: Screen;

    player: YouTube.Player;

    onCue = new Subject<Video>();
    onPlay = new Subject<Seconds>();
    onPause = new Subject<Seconds>();
    onSpeedChange = new Subject<number>();
    onScreenInit = new Subject<Screen>();
    onScreenResize: Observable<Screen>;
    onScreenDestroy = new Subject<void>();
    onAdStart = new Subject<void>();
    onAdEnd = new Subject<void>();

    private playing = false;
    private adStarted = false;
    private speedRate = 1;
    private resizeCaptureInterval: number = null;
    private _resizeObserver: Subject<Screen>;

    constructor() {
        // Bounces happens when entering fullscreen
        // Use sampleTime to debound resize events.
        this.onScreenResize = (<Observable<Screen>>(
            this._resizeObserver = new Subject<Screen>()
        ))
            .sampleTime(1000)
            .multicast(new Subject<Screen>())
            .refCount();
        Observable.fromEvent(document, 'DOMContentLoaded')
            .subscribe(() => this.hijectYouTubePlayerReady());
    }

    cue() {
        const { player } = this;
        const videoData = player.getVideoData();
        if (this.video && this.video.id === videoData.video_id)
            return;
        this.video = {
            id: videoData.video_id,
            url: player.getVideoUrl(),
            title: videoData.title,
            service: 'YouTube',
            duration: player.getDuration()
        };
        this.onCue.next(this.video);
    }

    play() {
        if (this.playing) return;
        const { player } = this;
        this.screenInit();
        this.cue();
        this.playing = true;
        this.onPlay.next(player.getCurrentTime());
    }

    pause() {
        if (!this.playing) return;
        this.playing = false;
        this.onPause.next(this.player.getCurrentTime());
    }

    setSpeed(rate: number) {
        if (this.speedRate === rate) return;
        this.speedRate = rate
        this.onSpeedChange.next(rate);
    }

    screenInit() {
        if (this.screen) return;
        const { player } = this;
        const videoConfig = player.getCurrentVideoConfig();
        const e = document.getElementById(videoConfig.attrs.id);
        this.screen = {
            e: e,
            width: e.clientWidth,
            height: e.clientHeight,
            fullscreen: false
        };
        this.startCaptureResize();
        this.onScreenInit.next(this.screen);
    }

    screenDestroy() {
        if (!this.screen) return;
        this.stopCaptureResize();
        this.screen = null;
        this.onScreenDestroy.next();
    }

    startCaptureResize() {
        if (this.resizeCaptureInterval != null) return;
        this.resizeCaptureInterval = setInterval(this.resizeCaptureFn.bind(this), 20);
    }

    stopCaptureResize() {
        if (this.resizeCaptureInterval == null) return;
        clearInterval(this.resizeCaptureInterval);
        this.resizeCaptureInterval = null;
    }

    resizeCaptureFn() {
        if (!this.screen) return;
        const rect = this.getScreenSize();
        if (rect.width === this.screen.width &&
            rect.height === this.screen.height)
            return;
        this.screen.width = rect.width;
        this.screen.height = rect.height;
        this._resizeObserver.next(this.screen);
    }

    adStart() {
        if (this.adStarted) return;
        this.pause();
        this.onAdStart.next();
    }

    adEnd() {
        if (!this.adStarted) return;
        this.onAdEnd.next();
        this.play();
    }

    unplay() {
        this.pause();
        this.screenDestroy();
    }

    setFullscreen(state: YouTube.FullscreenState) {
        if (!this.screen) return;
        if (this.screen.fullscreen == state.fullscreen) return;
        this.screen.fullscreen = state.fullscreen;
    }

    private getScreenSize(): ScreenSize {
        return {
            width: this.screen.e.offsetWidth,
            height: this.screen.e.offsetHeight
        };
    }

    private onStateChanged(state: State) {
        const { player } = this;
        switch (state) {
            case State.PLAYING:
                this.play();
                break;
            case State.UNSTARTED:
                this.unplay();
                break;
            case State.BUFFERING:
                this.cue();
                break;
            case State.CUED:
            case State.PAUSED:
                this.pause();
                break;
        }
    }

    private hijectYouTubePlayerReady() {
        let oldReady = window.onYouTubePlayerReady;
        window.onYouTubePlayerReady = (player) => {
            this.onYouTubePlayerReady(player);
            if (typeof oldReady == 'function')
                return oldReady(player);
        };
    }

    private onYouTubePlayerReady(player: YouTube.Player) {
        this.player = player;
        // The injection may happen after the video
        // starts playing. Here we check the video
        // state and emmit events immediately
        this.onStateChanged(player.getPlayerState());
        Observable.fromEvent(player, 'onStateChange')
            .subscribe(this.onStateChanged.bind(this));
        Observable.fromEvent(player, 'onAdStart')
            .subscribe(this.adStart.bind(this));
        Observable.fromEvent(player, 'onAdEnd')
            .subscribe(this.adEnd.bind(this));
        Observable.fromEvent(player, 'onPlaybackRateChange')
            .subscribe(this.setSpeed.bind(this));
        Observable.fromEvent(player, 'onFullscreenChange')
            .subscribe(this.setFullscreen.bind(this));
    }
}
