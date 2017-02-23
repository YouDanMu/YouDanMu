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

    export class Player {

        events: { [key: string]: Subject<any> } = {
            onStateChange: new Subject()
        };

        subscriptions = new Map<Function, { [key: string]: Subscription }>();

        e: HTMLDivElement;

        constructor() {
            this.e = document.createElement('div');
            this.e.id = 'movie-player';
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

        }

        pauseVideo(): void {

        }

        stopVideo(): void {

        }

        seekTo(seconds: number, allowSeekAhead: boolean): void {

        }

        nextVideo(): void {

        }

        previousVideo(): void {

        }

        playVideoAt(index: number): void {

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
            return 1;
        }

        setPlaybackRate(suggestedRate: number): void {

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
            return PlayerState.PAUSED;
        }

        getCurrentTime(): number {
            return 5.066483;
        }

        getPlaybackQuality(): string {
            return 'hd720';
        }

        setPlaybackQuality(suggestedQuality: string): void {

        }

        getAvailableQualityLevels(): string[] {
            return ['hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'auto'];
        }

        getDuration(): number {
            return 1523.881;
        }

        getVideoUrl(): string {
            return 'https://www.youtube.com/watch?t=5&v=SLHVAHEaBQg';
        }

        getVideoEmbedCode(): string {
            return '<iframe width="1280" height="720" src="https://www.youtube.com/embed/SLHVAHEaBQg" frameborder="0" allowfullscreen></iframe>';
        }

        getPlaylist(): string[] {
            return null;
        }

        getPlaylistIndex(): number {
            return -1;
        }

        getVideoData(): VideoData {
            return {
                author: 'Metacoder',
                title: 'YouDanMu Test Video',
                video_id: '3jIcj8Heu3f',
                video_quality: 'hd720'
            };
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

        hideVideoInfo():void {

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
            let observable = this.events[event];
            if (!observable) return;
            let subscriptions: { [key: string]: Subscription };
            if (this.subscriptions.has(listener)) {
                subscriptions = this.subscriptions.get(listener);
                if (subscriptions[event]) return;
            } else {
                subscriptions = {};
                this.subscriptions.set(listener, subscriptions);
            }
            subscriptions[event] = observable.subscribe(listener);
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
            let subscriptions: { [key: string]: Subscription };
            if (!this.subscriptions.has(listener)) return;
            subscriptions = this.subscriptions.get(listener);
            if (!subscriptions[event]) return;
            subscriptions[event].unsubscribe();
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
