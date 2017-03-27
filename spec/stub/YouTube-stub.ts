/// <reference path="../../src/ts/typings/YouTube.d.ts" />

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

export namespace YouTube {

    export enum PlayerState {
        UNSTARTED = -1,
        ENDED,
        PLAYING,
        PAUSED,
        BUFFERING,
        UNDEFINED,
        CUED
    }

    export interface CueVideoByIdOptions {
        videoId: string;
        startSeconds: number;
        suggestedQuality: string;
    }

    export interface LoadVideoByIdOptions {
        videoId: string;
        startSeconds: number;
        endSeconds: number;
        suggestedQuality: string;
    }

    export interface CueVideoByUrlOptions {
        mediaContentUrl: string;
        startSeconds: number;
        suggestedQuality: string;
    }

    export interface LoadVideoByUrlOptions {
        mediaContentUrl: string;
        startSeconds: number;
        endSeconds: number;
        suggestedQuality: string;
    }

    export interface CuePlaylistOptions {
        listType: string;
        list: string;
        index: number;
        startSeconds: number;
        suggestedQuality: string;
    }

    export interface LoadPlaylistOptions {
        listType: string;
        list: string;
        index: number;
        startSeconds: number;
        suggestedQuality: string;
    }

    export interface VideoData {
        author: string;
        title: string;
        video_id: string;
        video_quality: string;
    }

    export interface FullscreenState {
        fullscreen: boolean;
        time: number;
        videoId: string;
    }

    export interface VideoConfig {
        args?: any,
        assets?: any,
        attrs?: {
            id?: string;
            width?: string;
            height?: string;
        }
        disable?: any;
        fallback?: any;
        fallbackMessage?: any;
        html5?: boolean;
        loaded?: boolean;
        messages?: any;
        minVersion?: string;
        params?: any;
        url?: string;
    }

    export interface VideoContentRect {
        top: number;
        left: number;
        width: number;
        height: number;
    }

    export interface PlayerSize {
        width: number;
        height: number;
    }

    export class Player {

        e: HTMLDivElement;

        private _state: PlayerState;

        get state(): PlayerState {
            return this._state;
        }

        set state(state: PlayerState) {
            this._state = state;
            this.events.get('onStateChange').next(state);
        }

        private _videoData: VideoData;

        get videoData(): VideoData {
            return this._videoData;
        }

        set videoData(videoDate: VideoData) {
            this._videoData = videoDate;
        }

        private _time: number;

        get time(): number {
            if (this.timestamp != null) {
                return this._time + (performance.now() - this.timestamp) / 1000;
            }
            return this._time;
        }

        set time(time: number) {
            if (this.timestamp != null) {
                this.timestamp = performance.now();
            }
            this._time = time;
        }
        
        private timestamp: number;

        private _playbackRate: number;

        get playbackRate(): number {
            return this._playbackRate;
        }

        set playbackRate(r: number) {
            this._playbackRate = r;
            this.events.get('onPlaybackRateChange').next(r);
        }

        private _playerSize: PlayerSize;

        get playerSize(): PlayerSize {
            return this._playerSize;
        }

        set playerSize(size: PlayerSize) {
            this.e.style.width = `${size.width}px`;
            this.e.style.height = `${size.height}px`;
            this._playerSize = size;
        }

        events = new Map<string, Subject<any>>();

        listeners = new Map<string, Map<Function, Subscription>>();

        constructor() {
            this.e = document.createElement('div');
            this.e.id = 'movie_player';
            this.events.set('onStateChange', new Subject());
            this.events.set('onAdStart', new Subject());
            this.events.set('onAdEnd', new Subject());
            this.events.set('onPlaybackRateChange', new Subject());
            this.events.set('onFullscreenChange', new Subject());
            this.state = PlayerState.UNSTARTED;
            this.time = 0;
            this.playbackRate = 1;
            this.playerSize = { width: 854, height: 480 };
            this.cue({
                author: '',
                title: '',
                video_id: undefined,
                video_quality: undefined
            });
        }

        mount() {
            document.getElementById('movie-outter').appendChild(this.e);
        }

        unmount() {
            this.e.remove();
        }

        cue(videoData: VideoData): void {
            this.videoData = videoData;
            this.state = PlayerState.CUED;
        }

        cueVideoById(options: CueVideoByIdOptions): void;
        cueVideoById(videoId: string, startSeconds: number, suggestedQuality: string): void;
        cueVideoById(videoIdOrOptions: CueVideoByIdOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        loadVideoById(options: LoadVideoByIdOptions): void;
        loadVideoById(videoId: string, startSeconds: number, suggestedQuality: string): void;
        loadVideoById(videoIdOrOptions: LoadVideoByIdOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        cueVideoByUrl(options: CueVideoByUrlOptions): void;
        cueVideoByUrl(mediaContentUrl: string, startSeconds: number, suggestedQuality: string): void;
        cueVideoByUrl(mediaContentUrlOrOptions: CueVideoByUrlOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        loadVideoByUrl(options: LoadVideoByUrlOptions): void;
        loadVideoByUrl(mediaContentUrl: string, startSeconds: number, suggestedQuality: string): void;
        loadVideoByUrl(mediaContentUrlOrOptions: LoadVideoByUrlOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        cuePlaylist(options: CuePlaylistOptions): void;
        cuePlaylist(playlist: string | string[], index: number, startSeconds: number, suggestedQuality: string): void;
        cuePlaylist(playlistOrOptions: CuePlaylistOptions | string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void {

        }

        loadPlaylist(options: LoadPlaylistOptions): void;
        loadPlaylist(playlist: string | string[], index: number, startSeconds: number, suggestedQuality: string): void;
        loadPlaylist(playlistOrOptions: LoadPlaylistOptions | string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void {

        }

        playVideo(): void {
            this.timestamp = performance.now();
            this.state = PlayerState.PLAYING;
        }

        pauseVideo(): void {
            this._time = this.time;
            this.timestamp = null;
            this.state = PlayerState.PAUSED;
        }

        stopVideo(): void {
            this.timestamp = null;
            this.time = 0;
            this.state = PlayerState.ENDED;
        }

        seekTo(seconds: number, allowSeekAhead: boolean): void {
            if (this.timestamp) {
                this.pauseVideo();
                this.time = seconds;
                this.playVideo();
            } else {
                this.time = seconds;
            }
        }

        nextVideo(): void {

        }

        previousVideo(): void {

        }

        playVideoAt(index: number): void {

        }

        adStart(): void {
            this.events.get('onAdStart').next();
        }

        adEnd(): void {
            this.events.get('onAdEnd').next();
        }

        mute(): void {

        }

        unMute(): void {

        }

        isMuted(): boolean {
            return false;
        }

        setVolume(volume: number): void {

        }

        getVolume(): number {
            return 100;
        }

        getPlaybackRate(): number {
            return this.playbackRate;
        }

        setPlaybackRate(suggestedRate: number): void {
            this.playbackRate = suggestedRate;
        }

        getAvailablePlaybackRates(): number[] {
            return [0.25, 0.5, 1, 1.25, 1.5, 2];
        }

        setLoop(loopPlaylists: boolean): void {

        }

        setShuffle(shufflePlaylist: boolean): void {

        }

        getVideoLoadedFraction(): number {
            return 0.06696126534814725;
        }

        getPlayerState(): number {
            return this.state;
        }

        getCurrentTime(): number {
            return this.time;
        }

        getPlaybackQuality(): string {
            return this.videoData.video_quality;
        }

        setPlaybackQuality(suggestedQuality: string): void {
            this.videoData.video_quality = suggestedQuality;
        }

        getAvailableQualityLevels(): string[] {
            return ['hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'auto'];
        }

        getDuration(): number {
            return 1523.881;
        }

        getVideoUrl(): string {
            return `https://www.youtube.com/watch?t=5&v=${this.videoData.video_id}`;
        }

        getVideoEmbedCode(): string {
            return `<iframe width="1280" height="720" src="https://www.youtube.com/embed/${this.videoData.video_id}" frameborder="0" allowfullscreen></iframe>`;
        }

        getPlaylist(): string[] {
            return null;
        }

        getPlaylistIndex(): number {
            return -1;
        }

        getVideoData(): VideoData {
            return this.videoData;
        }

        getCurrentVideoConfig(): VideoConfig {
            return {
                attrs: {
                    id: 'movie_player'
                }
            };
        }

        getVideoContentRect(): VideoContentRect {
            return {
                top: 0,
                left: 0,
                width: 1280,
                height: 720
            };
        }

        showVideoInfo(): void {

        }

        hideVideoInfo(): void {

        }

        setFullscreen(fullscreen: boolean) {
            this.events.get('onFullscreenChange').next({
                fullscreen,
                time: this.time,
                videoId: this.videoData.video_id
            })
        }

        addEventListener(event: 'onStateChange', listener: ((state: number) => void)): void;
        addEventListener(event: 'onVideoProgress', listener: string | ((currentTime: number) => void)): void;
        addEventListener(event: 'onPlaybackQualityChange', listener: ((quality: string) => void)): void;
        addEventListener(event: 'onPlaybackRateChange', listener: ((rate: number) => void)): void;
        addEventListener(event: 'onError', listener: ((error: number) => void)): void;
        addEventListener(event: 'onApiChange', listener: ((error: number) => void)): void;
        addEventListener(event: 'SIZE_CLICKED', listener: string | ((theaterMode: boolean) => void)): void;
        addEventListener(event: 'onFullscreenChange', listener: string | ((fullscreen: FullscreenState) => void)): void;
        addEventListener(event: 'onAdAnnounce', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdStart', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdComplete', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdSkip', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdEnd', listener: string | ((val: any) => void)): void;
        addEventListener(event: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void;
        addEventListener(event: string, listener: (val: any) => void): void {
            const observable = this.events.get(event);
            if (!observable) return;
            let listeners = this.listeners.get(event);
            if (listeners) {
                const subscription = listeners.get(listener);
                if (subscription) return;
            } else {
                listeners = new Map<Function, Subscription>();
                this.listeners.set(event, listeners);
            }
            listeners.set(listener, observable.subscribe(listener));
        }

        dispatchEvent(evt: Event): boolean {
            return true;
        }

        removeEventListener(event: 'onStateChange', listener: string | ((state: number) => void)): void;
        removeEventListener(event: 'onVideoProgress', listener: string | ((currentTime: number) => void)): void;
        removeEventListener(event: 'onPlaybackQualityChange', listener: string | ((quality: string) => void)): void;
        removeEventListener(event: 'onPlaybackRateChange', listener: string | ((rate: number) => void)): void;
        removeEventListener(event: 'onError', listener: string | ((error: number) => void)): void;
        removeEventListener(event: 'onApiChange', listener: string | ((error: number) => void)): void;
        removeEventListener(event: 'SIZE_CLICKED', listener: string | ((theaterMode: boolean) => void)): void;
        removeEventListener(event: 'onFullscreenChange', listener: string | ((fullscreen: FullscreenState) => void)): void;
        removeEventListener(event: 'onAdAnnounce', listener: string | ((val: any) => void)): void;
        removeEventListener(event: 'onAdStart', listener: string | ((val: any) => void)): void;
        removeEventListener(event: 'onAdComplete', listener: string | ((val: any) => void)): void;
        removeEventListener(event: 'onAdSkip', listener: string | ((val: any) => void)): void;
        removeEventListener(event: 'onAdEnd', listener: string | ((val: any) => void)): void;
        removeEventListener(event: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void;
        removeEventListener(event: string, listener: (val: any) => void): void {
            const listeners = this.listeners.get(event);
            if (!listeners) return;
            const subscription = listeners.get(listener);
            if (!subscription) return;
            subscription.unsubscribe();
        }
    }

    export class API {
        player: Player;
        constructor() {
            this.player = new Player();
            if (typeof window.onYouTubePlayerReady === 'function') {
                window.onYouTubePlayerReady(this.player);
            }
        }
    }
}
