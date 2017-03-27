import { YouDanMu } from '../YouDanMu';
import { Logger } from '../YouDanMu/util/Logger';
import { YouTubeVideoService } from '../YouDanMu/VideoService';

import { YouTube } from './stub/YouTube-stub';

import { SegmentsTest } from './Segments-spec';
import { YouTubeVideoServiceTest } from './YouTubeVideoService-spec';

Logger.debugLevel = 3;

SegmentsTest();

const ydm = new YouDanMu();
const videoService = new YouTubeVideoService(ydm);
ydm.videoService = videoService;

let yt: YouTube.API;

function initializeYouTubeAPI(): Promise<YouTube.API> {
    return new Promise<YouTube.API>((resolve, reject) => {
        document.addEventListener('DOMContentLoaded', () => {
            yt = new YouTube.API();
            resolve();
        });
    });
}

initializeYouTubeAPI()
    .then(() => YouTubeVideoServiceTest(videoService, yt.player))
    .then(() => yt.player.unmount());
