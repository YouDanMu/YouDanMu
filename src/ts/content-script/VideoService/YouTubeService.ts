/// <reference path="../../typings/YouTube.d.ts" />

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';

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

// TODO:
//      When video is unplayed, dispatch onScreenDestroy event.
//      When video is cued, buffering, and immediately after onYouTubePlayerReady,
//      check for new video, create a new event type onVideo and dispatch it
//      Capture onScreenResize and onScreenDestroy events

export class YouTubeService implements VideoService {
    video: Video;
    screen: Screen;

    player: YouTube.Player;

    onCue = new Subject<Video>();
    onPlay = new Subject<Seconds>();
    onPause = new Subject<Seconds>();
    onSpeedChange = new Subject<number>();
    onScreenInit = new Subject<Screen>();
    onScreenResize = new Subject<Screen>();
    onScreenDestroy = new Subject<void>();

    private playing = false;
    private speedRate = 1;
    private fullscreen = false;

    constructor() {
        Observable.fromEvent(document, 'DOMContentLoaded')
            .subscribe(() => this.hijectYouTubePlayerReady());
    }

    play() {
        if (this.playing) return;
        const { player } = this;
        const videoData = player.getVideoData();
        const videoConfig = player.getCurrentVideoConfig();
        // Check if the screen exists.
        // If not, create one.
        if (!this.screen) {
            const rect = player.getVideoContentRect();
            this.screen = {
                width: rect.width,
                height: rect.height,
                fullscreen: this.fullscreen
            };
            this.onScreenInit.next(this.screen);
        }
        // Check if a new video is playing.
        // If so dispatch the cue event.
        if (!this.video || videoData.video_id !== this.video.id) {
            this.video = {
                id: videoData.video_id,
                url: player.getVideoUrl(),
                title: videoData.title,
                service: 'YouTube',
                duration: player.getDuration()
            };
            this.onCue.next(this.video);
        }
        this.playing = true;
        // Verify the video is loaded with config indicating
        // a main video other on page ads.
        if (videoConfig.attrs.id === 'movie_player')
            // Dispatch the play event
            this.onPlay.next(player.getCurrentTime());
    }

    pause() {
        if (!this.playing) return;
        // Dispatch the pause event
        this.playing = false;
        this.onPause.next(this.player.getCurrentTime());
    }

    cue() {
        
    }

    setSpeed(rate: number) {
        if (this.speedRate === rate) return;
        this.speedRate = rate
        this.onSpeedChange.next(rate);
    }

    private onStateChanged(state: State) {
        const { player } = this;
        switch (state) {
            case State.PLAYING:
                this.play();
                break;
            case State.UNSTARTED:
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
        Observable.fromEvent(player, 'onStateChange')
            .subscribe(this.onStateChanged.bind(this));
        Observable.fromEvent(player, 'onAdStart')
            .subscribe(this.pause.bind(this));
        Observable.fromEvent(player, 'onAdEnd')
            .subscribe(this.play.bind(this));
        Observable.fromEvent(player, 'onPlaybackRateChange')
            .subscribe(this.setSpeed.bind(this));
    }
}
