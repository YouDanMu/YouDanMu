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
    private _button: HTMLButtonElement;
    private resizeCaptureInterval: number;
    private _resizeObserver = new Subject<Screen>();

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        // Bounces happens when entering fullscreen
        // Use sampleTime to debound resize events.
        (<Observable<Screen>>(this._resizeObserver))
            .sampleTime(1000).subscribe(s => {
                this.screen.next(s);
                if (s) this.event.next(PlayerEvent.ScreenResize);
            });
        document.addEventListener('DOMContentLoaded', this.hijectYouTubePlayerReady);
        // Development level logging
        this.state.subscribe(state => console.log(3, 'State:', PlayerState[state]));
        this.event.subscribe(event => console.log(3, 'Event:', PlayerEvent[event]));
    }

    cue(): void {
        const _cue = (nextState: PlayerState) => {
            const { player } = this;
            const videoData = player.getVideoData();
            this.video.next({
                id: videoData.video_id,
                url: player.getVideoUrl(),
                title: videoData.title,
                service: 'YouTube',
                duration: player.getDuration()
            });
            this.event.next(PlayerEvent.Cue);
            this.state.next(nextState);
        };
        switch (this.state.value) {
            case PlayerState.Idle:
                _cue(PlayerState.Cued);
                break;
            case PlayerState.ScreenInit:
                _cue(PlayerState.Ready);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.Cue);
        }
    }

    play() {
        if (this.state.value === PlayerState.Ready) {
            this.event.next(PlayerEvent.Play);
            this.state.next(PlayerState.Playing);
        } else {
            this.unknownEventTransition(PlayerEvent.Play);
        }
    }

    pause() {
        if (this.state.value === PlayerState.Playing) {
            this.event.next(PlayerEvent.Pause);
            this.state.next(PlayerState.Ready);
        } else {
            this.unknownEventTransition(PlayerEvent.Pause);
        }
    }

    screenInit() {
        const _screenInit = (nextState: PlayerState) => {
            const { player } = this;
            const videoConfig = player.getCurrentVideoConfig();
            const e = document.getElementById(videoConfig.attrs.id);
            this.screen.next({
                e: e,
                width: e.clientWidth,
                height: e.clientHeight,
                fullscreen: false
            });
            this.installDanmakuButton();
            this.startCaptureResize();
            this.event.next(PlayerEvent.ScreenInit);
            this.state.next(nextState);
        }
        switch (this.state.value) {
            case PlayerState.Idle:
                _screenInit(PlayerState.ScreenInit);
                break;
            case PlayerState.Cued:
                _screenInit(PlayerState.Ready);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.ScreenInit);
        }
    }

    screenDestroy() {
        const _screenDestroy = (nextState: PlayerState) => {
            this.stopCaptureResize();
            this.screen.next(null);
            this.uninstallDanmakuButton();
            this.event.next(PlayerEvent.ScreenDestroy);
            this.state.next(nextState);
        };
        switch (this.state.value) {
            case PlayerState.Ready:
                _screenDestroy(PlayerState.Cued);
                break;
            case PlayerState.ScreenInit:
                _screenDestroy(PlayerState.Idle);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.ScreenDestroy);
        }
    }

    adPlay = () => {
        if (this.state.value === PlayerState.Ready) {
            this.event.next(PlayerEvent.AdPlay);
            this.state.next(PlayerState.AdPlaying);
        } else {
            this.unknownEventTransition(PlayerEvent.AdPlay);
        }
    }

    adPause = () => {
        switch (this.state.value) {
            case PlayerState.AdPlaying:
                this.event.next(PlayerEvent.AdPause);
                this.state.next(PlayerState.Ready);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.AdPause);
        }
    }

    uncue() {
        switch (this.state.value) {
            case PlayerState.Ready:
                this.video.next(null);
                this.event.next(PlayerEvent.Uncue);
                this.state.next(PlayerState.ScreenInit);
                break;
            case PlayerState.Cued:
                this.video.next(null);
                this.event.next(PlayerEvent.Uncue);
                this.state.next(PlayerState.Idle);
                break;
            default:
                this.unknownEventTransition(PlayerEvent.AdPause);
        }
    }

    setSpeed = (speed: number) => {
        this.speed.next(speed);
        this.event.next(PlayerEvent.SpeedChange);
    }

    setFullscreen = (state: YouTube.FullscreenState) => {
        const screen = this.screen.value;
        this._resizeObserver.next({
            e: screen.e,
            width: screen.width,
            height: screen.height,
            fullscreen: state.fullscreen
        });
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

    private gotoReady() {
        if (this.state.value === PlayerState.Idle) this.screenInit();
        if (this.state.value === PlayerState.ScreenInit) this.cue();
        if (this.state.value === PlayerState.Cued) this.screenInit();
        if (this.state.value === PlayerState.AdPlaying) this.adPause();
        if (this.state.value === PlayerState.Playing) this.pause();
    }

    private gotoIdle() {
        if (this.state.value === PlayerState.Playing) this.pause();
        if (this.state.value === PlayerState.AdPlaying) this.adPause();
        if (this.state.value === PlayerState.Ready) this.screenDestroy();
        if (this.state.value === PlayerState.Cued) this.uncue();
        if (this.state.value === PlayerState.ScreenInit) this.screenDestroy();
    }

    private gotoPlaying() {
        if (this.state.value === PlayerState.Idle) this.screenInit();
        if (this.state.value === PlayerState.ScreenInit) this.cue();
        if (this.state.value === PlayerState.Cued) this.screenInit();
        if (this.state.value === PlayerState.AdPlaying) this.adPause();
        if (this.state.value === PlayerState.Ready) this.play();
    }

    private gotoAdPlaying() {
        if (this.state.value === PlayerState.Idle) this.screenInit();
        if (this.state.value === PlayerState.ScreenInit) this.cue();
        if (this.state.value === PlayerState.Cued) this.screenInit();
        if (this.state.value === PlayerState.Playing) this.pause();
        if (this.state.value === PlayerState.Ready) this.adPlay();
    }

    private installDanmakuButton() {
        if (!this._button) {
            this.generateDanmakuButton();
        }
        const controls = this.screen.value.e
            .querySelector('.ytp-right-controls');
        if (controls) {
            controls.appendChild(this._button);
            controls.insertBefore(this._button, controls.firstChild);
        }
    }

    private uninstallDanmakuButton() {
        if (this._button) {
            this._button.remove();
        }
    }

    private generateDanmakuButton() {
        this._button = document.createElement('button');
        this._button.setAttribute('id', 'ydm-youtube-danmaku-button');
        this._button.classList.add('ytp-button');
        this._button.setAttribute('title', 'Danmaku Settings');
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('height', '100%');
        icon.setAttribute('viewBox', '0 0 36 36');
        icon.setAttribute('width', '100%');
        const usetag = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        usetag.classList.add('ytp-svg-shadow');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 23.33 10 H 12.67 A 2.66 2.66 0 0 0 10 12.67 v 6.66 A 2.66 2.66 0 0 0 12.67 22 H 14.8 L 18 26 V 22 h 5.33 A 2.66 2.66 0 0 0 26 19.33 V 12.67 A 2.66 2.66 0 0 0 23.33 10 Z M 19 17 H 13 V 15 h 6 Z m 4 0 H 20 V 15 h 3 Z m 0 -3 H 13 V 12 H 23 Z');
        path.setAttribute('fill', '#fff');
        path.setAttribute('transform', 'translate(0 2)');
        icon.appendChild(usetag);
        icon.appendChild(path);
        this._button.appendChild(icon);
        this._button.title = '__MSG_SettingsViewTitle__';
        this._button.addEventListener('click', this.onDanmakuButtonClicked.bind(this));
    }

    private onDanmakuButtonClicked() {
        this.event.next(PlayerEvent.DanmakuButton);
    }

    private startCaptureResize() {
        this.resizeCaptureInterval = setInterval(this.resizeCaptureFn.bind(this), 20);
    }

    private stopCaptureResize() {
        this.resizeCaptureInterval = void clearInterval(this.resizeCaptureInterval);
    }

    private resizeCaptureFn() {
        const screen = this.screen.value;
        const { e } = screen;
        const width = screen.e.offsetWidth;
        const height = screen.e.offsetHeight;
        if (!e.parentElement || e.parentElement.parentElement.parentElement.classList.contains('off-screen')) {
            this.gotoIdle();
        } else if (width !== screen.width || height !== screen.height) {
            this._resizeObserver.next({
                e,
                width: width,
                height: height,
                fullscreen: screen.fullscreen
            });
        }
    }

    private onStateChanged = (state: YouTubeState) => {
        console.log(3, 'YouTube State:', YouTubeState[state], state);
        const { player } = this;
        switch (state) {
            case YouTubeState.UNSTARTED:
                this.ytUNSTARTED();
                break;
            case YouTubeState.ENDED:
                this.ytENDED();
                break;
            case YouTubeState.PLAYING:
                this.ytPLAYING();
                break;
            case YouTubeState.PAUSED:
                this.ytPAUSED();
                break;
            case YouTubeState.BUFFERING:
                this.ytBUFFERING();
                break;
            case YouTubeState.CUED:
                this.ytCUED();
                break;
        }
    }

    private ytUNSTARTED() {
        // YouTubeState.UNSTARTED emitted
        // This can happend at two kinds of situations
        try {
            const videoData = this.player.getVideoData();
            if (!videoData.title && !videoData.author) {
                // Video is uncued
                this.gotoIdle();
            } else {
                // Video is just cued, and immediately ready to play
                this.gotoReady();
            }
        } catch (e) {
            // The API is destroied, go idle
            this.gotoIdle();
        }
    }

    private ytCUED() {
        // YouTubeState.CUED emitted
        // This can happend at two kinds of situations
        try {
            const videoData = this.player.getVideoData();
            if (!videoData.title && !videoData.author) {
                // Video is uncued
                this.gotoIdle();
            } else {
                // Video is just cued, and immediately ready to play
                this.gotoReady();
            }
        } catch (e) {
            // The API is destroied, go idle
            this.gotoIdle();
        }
    }

    private ytPLAYING() {
        // YouTubeState.PLAYING emitted
        this.gotoReady();
        this.play();
    }

    private ytBUFFERING() {
        // YouTubeState.BUFFERING emitted
        // Currently this event is too ambiguous to be useful
    }

    private ytENDED() {
        // YouTubeState.ENDED emitted
        // Currently this only happens when the time reaches the end
        this.gotoReady();
    }

    private ytPAUSED() {
        // YouTubeState.PAUSED emitted
        this.gotoReady();
    }

    private hijectYouTubePlayerReady = () => {
        let oldReady = window.onYouTubePlayerReady;
        window.onYouTubePlayerReady = (player) => {
            this.onYouTubePlayerReady(player);
            if (typeof oldReady == 'function')
                return oldReady(player);
        };
    }

    private onYouTubePlayerReady = (player: YouTube.Player) => {
        this.player = player;
        // The injection may happen after the video
        // starts playing. Here we check the video
        // state and emmit events immediately
        this.onStateChanged(player.getPlayerState());
        player.addEventListener('onStateChange', this.onStateChanged);
        player.addEventListener('onAdStart', this.adPlay);
        player.addEventListener('onAdEnd', this.adPause);
        player.addEventListener('onPlaybackRateChange', this.setSpeed);
        player.addEventListener('onFullscreenChange', this.setFullscreen);
    }

    private unknownEventTransition(event: PlayerEvent) {
        console.error(1, `Unknown event "${PlayerEvent[event]}" transition from state "${PlayerState[this.state.value]}".`);
    }
}
