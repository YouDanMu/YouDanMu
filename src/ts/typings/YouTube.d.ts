// Reference: https://developers.google.com/youtube/js_api_reference

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

    class Player {
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
        getVideoEmbedCode(): string;

        // Retrieving playlist information

        getPlaylist(): string[];
        getPlaylistIndex(): number;

        // Adding or removing an event listener

        addEventListener(event: 'onStateChange', listener: string | ((state: number) => any)): void;
        addEventListener(event: 'onPlaybackQualityChange', listener: string | ((quality: string) => any)): void;
        addEventListener(event: 'onPlaybackRateChange', listener: string | ((rate: number) => any)): void;
        addEventListener(event: 'onError', listener: string | ((error: number) => any)): void;
        addEventListener(event: 'onApiChange', listener: string | ((error: number) => any)): void;

        removeEventListener(event: string, listener: string | Function): void;
    }

    class API {

        player: Player;

    }
}
