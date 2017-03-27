import { YouTubeVideoService, PlayerState } from '../YouDanMu/VideoService';

import { YouTube } from './stub/YouTube-stub';
import { videoData } from './data';

const { expect } = chai;

export function YouTubeVideoServiceTest(videoService: YouTubeVideoService, yt: YouTube.API) {
    describe('VideoService/YouTubeVideoService', () => {
        it('should capture YouTube Player API object in initialization', () => {
            expect(videoService.player).to.equal(yt.player);
        });

        it('should initialize to Idle state', () => {
            expect(videoService.state.value).to.equal(PlayerState.Idle);
        });

        it('should inject onStateChange event listener to YouTube API', () => {
            expect(yt.player.listeners.get('onStateChange').has((<any>videoService).onStateChanged)).to.be.true;
        });

        it('should inject onAdStart event listener to YouTube API', () => {
            expect(yt.player.listeners.get('onAdStart').has((<any>videoService).adPlay)).to.be.true;
        });

        it('should inject onAdEnd event listener to YouTube API', () => {
            expect(yt.player.listeners.get('onAdEnd').has((<any>videoService).adPause)).to.be.true;
        });

        it('should inject onPlaybackRateChange event listener to YouTube API', () => {
            expect(yt.player.listeners.get('onPlaybackRateChange').has((<any>videoService).setSpeed)).to.be.true;
        });

        it('should inject onFullscreenChange event listener to YouTube API', () => {
            expect(yt.player.listeners.get('onFullscreenChange').has((<any>videoService).setFullscreen)).to.be.true;
        });

        it('should capture YouTube CUED event and transits to Ready state', () => {
            const states: PlayerState[] = [];
            const sub = videoService.state.subscribe((state) => {
                states.push(state);
            });
            yt.player.mount();
            yt.player.videoData = videoData.v1;
            expect(states).to.eql([
                PlayerState.Idle,
                PlayerState.ScreenInit,
                PlayerState.Ready
            ]);
            sub.unsubscribe();
        });

        it('should capture YouTube PLAYING event and transits to Playing state', () => {
            const states: PlayerState[] = [];
            const sub = videoService.state.subscribe((state) => {
                states.push(state);
            });
            yt.player.playVideo();
            expect(states).to.eql([
                PlayerState.Ready,
                PlayerState.Playing
            ]);
            sub.unsubscribe();
        });

        it('should capture YouTube time', () => {
            expect(videoService.getTime() - yt.player.time).to.below(0.01);
            yt.player.time = 25.23;
            expect(videoService.getTime() - yt.player.time).to.below(0.01);
        });

        it('should capture YouTube PAUSED event and transits to Ready state', () => {
            const states: PlayerState[] = [];
            const sub = videoService.state.subscribe((state) => {
                states.push(state);
            });
            yt.player.pauseVideo();
            expect(states).to.eql([
                PlayerState.Playing,
                PlayerState.Ready
            ]);
            sub.unsubscribe();
        });

        it('should capture YouTube seek event and transits to Ready then Playing state', () => {
            const states: PlayerState[] = [];
            const sub = videoService.state.subscribe((state) => {
                states.push(state);
            });
            yt.player.seekTo(50, true);
            expect(videoService.getTime() - yt.player.time).to.below(0.01);
            yt.player.playVideo();
            yt.player.seekTo(60, true);
            expect(videoService.getTime() - yt.player.time).to.below(0.01);
            expect(states).to.eql([
                PlayerState.Ready,
                PlayerState.Playing,
                PlayerState.Ready,
                PlayerState.Playing
            ]);
            sub.unsubscribe();
        });
    });
}