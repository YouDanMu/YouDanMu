/// <reference path="../../src/ts/typings/YouTube.d.ts" />

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

    export class Player {
        e: HTMLDivElement;
        constructor() {
            this.e = document.createElement('div');
            this.e.id = 'movie-player';
        }

        cueVideoById(videoIdOrOptions: CueVideoByIdOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        loadVideoById(videoIdOrOptions: LoadVideoByIdOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        cueVideoByUrl(mediaContentUrlOrOptions: CueVideoByUrlOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        loadVideoByUrl(mediaContentUrlOrOptions: LoadVideoByUrlOptions | string, startSeconds?: number, suggestedQuality?: string): void {

        }

        cuePlaylist(playlistOrOptions: CuePlaylistOptions | string | string[], index?: number, startSeconds?: number, suggestedQuality?: string): void {

        }

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


        addEventListener(event: string, listener: string | Function): void {

        }

        removeEventListener(event: string, listener: string | Function): void {

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
