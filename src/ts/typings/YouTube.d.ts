// Reference: https://developers.google.com/youtube/js_api_reference

/**
 * All listenable events (reverse engineered).
 * We might only interest in a few of these.
 * 
 *  onDetailedError, onTabOrderChange, onTabAnnounce,
 *  WATCH_LATER_VIDEO_ADDED, WATCH_LATER_VIDEO_REMOVED,
 *  onMouseWheelCapture, onMouseWheelRelease, onAdAnnounce, onStateChange,
 *  onPlaybackRateChange, onVideoProgress, SHARE_CLICKED, SIZE_CLICKED,
 *  onError, onFullscreenChange, onAdStart, onAdComplete, onAdSkip,
 *  onAdEnd, onAutonavChangeRequest, onAutonavPauseRequest,
 *  onFeedbackStartRequest, onFeedbackArticleRequest, onScreenChanged,
 *  onLogClientVeCreated, onLogServerVeCreated, onLogToGel,
 *  onLogVeClicked, onLogVesShown, onYpcContentRequest, SUBSCRIBE,
 *  UNSUBSCRIBE, onApiChange, captionschanged, CONNECTION_ISSUE,
 *  onVolumeChange
 */

interface Window {
    onYouTubePlayerReady: (player: YouTube.Player) => any;
}

declare namespace YouTube {

    interface CueVideoByIdOptions {
        videoId: string;
        startSeconds: number;
        suggestedQuality: string;
    }

    interface LoadVideoByIdOptions {
        videoId: string;
        startSeconds: number;
        endSeconds: number;
        suggestedQuality: string;
    }

    interface CueVideoByUrlOptions {
        mediaContentUrl: string;
        startSeconds: number;
        suggestedQuality: string;
    }

    interface LoadVideoByUrlOptions {
        mediaContentUrl: string;
        startSeconds: number;
        endSeconds: number;
        suggestedQuality: string;
    }

    interface CuePlaylistOptions {
        listType: string;
        list: string;
        index: number;
        startSeconds: number;
        suggestedQuality: string;
    }

    interface LoadPlaylistOptions {
        listType: string;
        list: string;
        index: number;
        startSeconds: number;
        suggestedQuality: string;
    }

    interface VideoData {
        author: string;
        title: string;
        video_id: string;
        video_quality: string;
    }

    interface FullscreenState {
        fullscreen: boolean;
        time: number;
        videoId: string;
    }

    interface VideoConfig {
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

    interface VideoContentRect {
        top: number;
        left: number;
        width: number;
        height: number;
    }

    class Player implements EventTarget {
        e: HTMLDivElement;
        
        // Queueing functions

        // Queueing functions for videos

        cueVideoById(options: CueVideoByIdOptions): void;
        cueVideoById(videoId: string, startSeconds: number, suggestedQuality: string): void;

        loadVideoById(options: LoadVideoByIdOptions): void;
        loadVideoById(videoId: string, startSeconds: number, suggestedQuality: string): void;

        cueVideoByUrl(options: CueVideoByUrlOptions): void;
        cueVideoByUrl(mediaContentUrl: string, startSeconds: number, suggestedQuality: string): void;

        loadVideoByUrl(options: LoadVideoByUrlOptions): void;
        loadVideoByUrl(mediaContentUrl: string, startSeconds: number, suggestedQuality: string): void;

        // Queueing functions for lists

        cuePlaylist(options: CuePlaylistOptions): void;
        cuePlaylist(playlist: string | string[], index: number, startSeconds: number, suggestedQuality: string): void;

        loadPlaylist(options: LoadPlaylistOptions): void;
        loadPlaylist(playlist: string | string[], index: number, startSeconds: number, suggestedQuality: string): void;

        // Playback controls and player settings

        // Playing a video

        playVideo(): void;
        pauseVideo(): void;
        stopVideo(): void;
        seekTo(seconds: number, allowSeekAhead: boolean): void;

        // Playing a video in a playlist

        nextVideo(): void;
        previousVideo(): void;
        playVideoAt(index: number): void;

        // Changing the player volume

        mute(): void;
        unMute(): void;
        isMuted(): boolean;
        setVolume(volume: number): void;
        getVolume(): number;
        
        // Setting the playback rate

        getPlaybackRate(): number;
        setPlaybackRate(suggestedRate: number): void;
        getAvailablePlaybackRates(): number[];

        // Setting playback behavior for playlists

        setLoop(loopPlaylists: boolean): void;
        setShuffle(shufflePlaylist: boolean): void;

        // Playback status

        getVideoLoadedFraction(): number;
        getPlayerState(): number;
        getCurrentTime(): number;

        // Playback quality

        getPlaybackQuality(): string;
        setPlaybackQuality(suggestedQuality: string): void;
        getAvailableQualityLevels(): string[];

        // Retrieving video information

        getDuration(): number;
        getVideoUrl(): string;
        getVideoData(): VideoData;
        getVideoEmbedCode(): string;
        getCurrentVideoConfig(): VideoConfig;

        // Retrieving playlist information

        getPlaylist(): string[];
        getPlaylistIndex(): number;

        // Retrieving screen information

        getVideoContentRect(): VideoContentRect;

        // Debugging interfaces

        // Show/hide video meta info panel on top of the video
        showVideoInfo(): void;
        hideVideoInfo(): void;

        // Adding or removing an event listener

        addEventListener(event: 'onStateChange', listener: string | ((state: number) => void)): void;
        addEventListener(event: 'onVideoProgress', listener: string | ((currentTime: number) => void)): void;
        addEventListener(event: 'onPlaybackQualityChange', listener: string | ((quality: string) => void)): void;
        addEventListener(event: 'onPlaybackRateChange', listener: string | ((rate: number) => void)): void;
        addEventListener(event: 'onError', listener: string | ((error: number) => void)): void;
        addEventListener(event: 'onApiChange', listener: string | ((error: number) => void)): void;
        addEventListener(event: 'SIZE_CLICKED', listener: string | ((theaterMode: boolean) => void)): void;
        addEventListener(event: 'onFullscreenChange', listener: string | ((fullscreen: FullscreenState) => void)): void;
        addEventListener(event: 'onAdAnnounce', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdStart', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdComplete', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdSkip', listener: string | ((val: any) => void)): void;
        addEventListener(event: 'onAdEnd', listener: string | ((val: any) => void)): void;
        addEventListener(event: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void;

        dispatchEvent(evt: Event): boolean;

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
    }

    class API {

        player: Player;

    }
}
