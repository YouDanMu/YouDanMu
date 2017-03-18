/// <reference path="../../typings/YouTube.d.ts" />

import { YouDanMu } from '..';
import { Canvas } from '../RenderService';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/operator/multicast';

import { Logger } from '../util';
import { Seconds, Video, Screen, VideoService, PlayerEvent, PlayerState } from './';

const console = new Logger('YouTubeService');

enum YouTubeState {
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

export class YouTubeVideoService implements VideoService {
    event = new Subject<PlayerEvent>();
    state = new BehaviorSubject(PlayerState.Idle);
    screen = new BehaviorSubject<Screen>(null);
    video = new BehaviorSubject<Video>(null);
    speed = new BehaviorSubject(1);

    player: YouTube.Player;

    private ydm: YouDanMu;
    private resizeCaptureInterval: number;
    private _resizeObserver = new Subject<Screen>();

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        // Bounces happens when entering fullscreen
        // Use sampleTime to debound resize events.
        (<Observable<Screen>>(this._resizeObserver))
            .sampleTime(1000).subscribe(this.screen);
        Observable.fromEvent(document, 'DOMContentLoaded')
            .subscribe(() => this.hijectYouTubePlayerReady());
        // Development level logging
        this.state.subscribe(state => console.log(3, 'State:', PlayerState[state]));
        this.event.subscribe(event => console.log(3, 'Event:', PlayerEvent[event]));
    }

    cue() {
        const { player } = this;
        const videoData = player.getVideoData();
        if (this.video.value && this.video.value.id === videoData.video_id)
            return; // Actually video unchanged
        this.video.next({
            id: videoData.video_id,
            url: player.getVideoUrl(),
            title: videoData.title,
            service: 'YouTube',
            duration: player.getDuration()
        });
        switch (this.state.value) {
            case PlayerState.Idle:
                this.event.next(PlayerEvent.Cue);
                this.state.next(PlayerState.Cued);
                break;
            case PlayerState.ScreenInit:
                this.event.next(PlayerEvent.Cue);
                this.state.next(PlayerState.Ready);
                break;
            case PlayerState.Ready:
            case PlayerState.Cued:
                break; // State unchanged.
            default:
                this.unknownEventTransition(PlayerEvent.Cue);
        }
    }

    play() {
        if (this.state.value === PlayerState.Idle) this.screenInit();
        if (this.state.value === PlayerState.ScreenInit) this.cue();
        if (this.state.value === PlayerState.Cued) this.screenInit();
        if (this.state.value === PlayerState.Ready) {
            this.event.next(PlayerEvent.Play);
            this.state.next(PlayerState.Playing);
        } else {
            this.unknownEventTransition(PlayerEvent.Play);
        }
    }

    pause() {
        switch (this.state.value) {
            case PlayerState.Playing:
                this.event.next(PlayerEvent.Pause);
                this.state.next(PlayerState.Ready);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.Pause);
        }
    }

    screenInit() {
        const { player } = this;
        const videoConfig = player.getCurrentVideoConfig();
        const e = document.getElementById(videoConfig.attrs.id);
        this.screen.next({
            e: e,
            width: e.clientWidth,
            height: e.clientHeight,
            fullscreen: false
        });
        this.startCaptureResize();
        switch (this.state.value) {
            case PlayerState.Idle:
                this.event.next(PlayerEvent.ScreenInit);
                this.state.next(PlayerState.ScreenInit);
                break;
            case PlayerState.Cued:
                this.event.next(PlayerEvent.ScreenInit);
                this.state.next(PlayerState.Ready);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.ScreenInit);
        }
    }

    screenDestroy() {
        this.stopCaptureResize();
        this.screen.next(null);
        switch (this.state.value) {
            case PlayerState.Ready:
                this.event.next(PlayerEvent.ScreenDestroy);
                this.state.next(PlayerState.Cued);
                break;
            case PlayerState.ScreenInit:
                this.event.next(PlayerEvent.ScreenDestroy);
                this.state.next(PlayerState.Idle);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.ScreenDestroy);
        }
    }

    adStart() {
        if (this.state.value === PlayerState.Playing) this.pause();
        if (this.state.value === PlayerState.Cued) this.screenInit();
        if (this.state.value === PlayerState.ScreenInit) this.cue();
        if (this.state.value === PlayerState.Ready) {
            this.event.next(PlayerEvent.AdPlay);
            this.state.next(PlayerState.AdPlaying);
        } else {
            this.unknownEventTransition(PlayerEvent.AdPlay);
        }
    }

    adEnd() {
        switch (this.state.value) {
            case PlayerState.AdPlaying:
                this.event.next(PlayerEvent.AdPause);
                this.state.next(PlayerState.Ready);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.AdPause);
        }
    }

    unplay() {
        if (this.state.value === PlayerState.Playing) this.pause();
        if (this.state.value === PlayerState.AdPlaying) this.adEnd();
        if (this.state.value === PlayerState.Ready ||
            this.state.value === PlayerState.ScreenInit)
            this.screenDestroy();
    }

    setSpeed(speed: number) {
        this.speed.next(speed);
        this.event.next(PlayerEvent.SpeedChange);
    }

    setFullscreen(state: YouTube.FullscreenState) {
        const screen = this.screen.value;
        this._resizeObserver.next({
            e: screen.e,
            width: screen.width,
            height: screen.height,
            fullscreen: state.fullscreen
        });
        this.event.next(PlayerEvent.ScreenResize);
    }

    installCanvas(canvas: Canvas) {
        const e = canvas.getDOM();
        const screen = this.screen.value;
        // The video content has z-index of 10.
        // Puts the canvas on z-index 11 to just top the video.
        e.style.zIndex = '11';
        screen.e.appendChild(e);
    }

    uninstallCanvas(canvas: Canvas) {
        const e = canvas.getDOM();
        e.remove();
    }

    getTime(): number {
        return this.player.getCurrentTime();
    }

    private startCaptureResize() {
        this.resizeCaptureInterval = setInterval(this.resizeCaptureFn.bind(this), 20);
    }

    private stopCaptureResize() {
        this.resizeCaptureInterval = void clearInterval(this.resizeCaptureInterval);
    }

    private resizeCaptureFn() {
        const screen = this.screen.value;
        const width = screen.e.offsetWidth;
        const height = screen.e.offsetHeight;
        if (width !== screen.width || height !== screen.height) {
            this._resizeObserver.next({
                e: screen.e,
                width: width,
                height: height,
                fullscreen: screen.fullscreen
            });
            this.event.next(PlayerEvent.ScreenResize);
        }
    }

    private onStateChanged(state: YouTubeState) {
        const { player } = this;
        switch (state) {
            case YouTubeState.PLAYING:
                this.play();
                break;
            case YouTubeState.UNSTARTED:
                this.unplay();
                break;
            case YouTubeState.BUFFERING:
                this.cue();
                break;
            case YouTubeState.CUED:
            case YouTubeState.PAUSED:
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

    private unknownEventTransition(event: PlayerEvent) {
        console.error(1, `Unknown event "${PlayerEvent[event]}" transition from state "${PlayerState[this.state.value]}".`);
    }
}
