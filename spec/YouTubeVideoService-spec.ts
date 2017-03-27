import { YouTubeVideoService, PlayerState, Screen } from '../YouDanMu/VideoService';

import { YouTube } from './stub/YouTube-stub';
import { videoData } from './data';

const { expect } = chai;

function assertScreen(screen: Screen, player: YouTube.Player) {
    expect({
        width: screen.width,
        height: screen.height
    }).to.eql(player.playerSize);
    expect(screen.e).to.equal(player.e);
}

export function YouTubeVideoServiceTest(videoService: YouTubeVideoService, player: YouTube.Player) {
    return new Promise((resolve, reject) => {
        describe('VideoService/YouTubeVideoService', () => {

            after(() => resolve());

            it('should capture YouTube Player API object in initialization', () => {
                expect(videoService.player).to.equal(player);
            });

            it('should initialize to Idle state', () => {
                expect(videoService.state.value).to.equal(PlayerState.Idle);
            });

            it('should inject onStateChange event listener to YouTube API', () => {
                expect(player.listeners.get('onStateChange').has((<any>videoService).onStateChanged)).to.be.true;
            });

            it('should inject onAdStart event listener to YouTube API', () => {
                expect(player.listeners.get('onAdStart').has((<any>videoService).adPlay)).to.be.true;
            });

            it('should inject onAdEnd event listener to YouTube API', () => {
                expect(player.listeners.get('onAdEnd').has((<any>videoService).adPause)).to.be.true;
            });

            it('should inject onPlaybackRateChange event listener to YouTube API', () => {
                expect(player.listeners.get('onPlaybackRateChange').has((<any>videoService).setSpeed)).to.be.true;
            });

            it('should inject onFullscreenChange event listener to YouTube API', () => {
                expect(player.listeners.get('onFullscreenChange').has((<any>videoService).setFullscreen)).to.be.true;
            });

            it('should capture YouTube CUED event and transits to Ready state', () => {
                const states: PlayerState[] = [];
                const sub = videoService.state.subscribe((state) => {
                    states.push(state);
                });
                player.mount();
                player.cue(videoData.v1);
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
                player.playVideo();
                expect(states).to.eql([
                    PlayerState.Ready,
                    PlayerState.Playing
                ]);
                sub.unsubscribe();
            });

            it('should capture YouTube time', () => {
                expect(videoService.getTime() - player.time).to.below(0.01);
                player.time = 25.23;
                expect(videoService.getTime() - player.time).to.below(0.01);
            });

            it('should capture YouTube PAUSED event and transits to Ready state', () => {
                const states: PlayerState[] = [];
                const sub = videoService.state.subscribe((state) => {
                    states.push(state);
                });
                player.pauseVideo();
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
                player.seekTo(50, true);
                expect(videoService.getTime() - player.time).to.below(0.01);
                player.playVideo();
                player.seekTo(60, true);
                expect(videoService.getTime() - player.time).to.below(0.01);
                expect(states).to.eql([
                    PlayerState.Ready,
                    PlayerState.Playing,
                    PlayerState.Ready,
                    PlayerState.Playing
                ]);
                sub.unsubscribe();
            });

            it('should capture YouTube loop event and transits to Ready then Playing state', () => {
                const states: PlayerState[] = [];
                const sub = videoService.state.subscribe((state) => {
                    states.push(state);
                });
                player.time = 0;
                player.state = YouTube.PlayerState.PLAYING;
                expect(videoService.getTime() - player.time).to.below(0.01);
                expect(states).to.eql([
                    PlayerState.Playing,
                    PlayerState.Ready,
                    PlayerState.Playing
                ]);
                sub.unsubscribe();
            });

            it('should capture YouTube ENDED event and transits to Ready', () => {
                const states: PlayerState[] = [];
                const sub = videoService.state.subscribe((state) => {
                    states.push(state);
                });
                player.stopVideo();
                expect(videoService.getTime()).to.equal(player.time);
                expect(states).to.eql([
                    PlayerState.Playing,
                    PlayerState.Ready
                ]);
                sub.unsubscribe();
            });

            it('should capture YouTube Autoplay event and transits to Playing', () => {
                const states: PlayerState[] = [];
                const sub = videoService.state.subscribe((state) => {
                    states.push(state);
                });
                player.videoData = videoData.empty;
                player.state = YouTube.PlayerState.UNSTARTED;
                player.cue(videoData.v2);
                player.state = YouTube.PlayerState.UNSTARTED;
                player.state = YouTube.PlayerState.BUFFERING;
                player.playVideo();
                expect(videoService.getTime() - player.time).to.below(0.01);
                expect(states).to.eql([
                    PlayerState.Ready,
                    PlayerState.Cued,
                    PlayerState.Idle,
                    PlayerState.ScreenInit,
                    PlayerState.Ready,
                    PlayerState.Playing
                ]);
                sub.unsubscribe();
            });

            it('should capture YouTube video size change event', function (done) {
                this.slow(1300);
                this.timeout(1500);
                assertScreen(videoService.screen.value, player);
                const newSize = {
                    width: 1280,
                    height: 720
                };
                // First time the observer is called with initialized screen value.
                let count = 1;
                const sub = videoService.screen.subscribe((screen) => {
                    if (count-- === 0) {
                        sub.unsubscribe();
                        try {
                            assertScreen(videoService.screen.value, player);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    }
                });
                player.playerSize = newSize;
                expect(player.playerSize).to.eql(newSize);
            });
        });
    });
}