import { YouDanMu } from '../YouDanMu';
import { Logger } from '../YouDanMu/util/Logger';
import { YouTubeVideoService } from '../YouDanMu/VideoService';
import { ChromeExtensionService } from '../YouDanMu/ExtensionService';

import { YouTube, ContentScript } from './stub';

import { SegmentTest, SegmentsTest } from './Segments-spec';
import { YouTubeVideoServiceTest } from './YouTubeVideoService-spec';
import { ChromeExtensionServiceTest } from './ChromeExtensionService-spec';

Logger.debugLevel = 3;

function initializeYouTubeAPI(): Promise<YouTube.API> {
    return new Promise<YouTube.API>((resolve, reject) => {
        document.addEventListener('DOMContentLoaded', () => {
            const api = new YouTube.API();
            yt.player = api.player;
            resolve();
        });
    });
}

const ydm = new YouDanMu();
const cs = new ContentScript();
const ext = new ChromeExtensionService(ydm);
const videoService = new YouTubeVideoService(ydm);

let yt: {player: YouTube.Player} = {
    player: null
};

let prev: Promise<any>;

prev = initializeYouTubeAPI();
prev = YouTubeVideoServiceTest(prev, videoService, yt);
prev = SegmentTest(prev);
prev = SegmentsTest(prev);
prev = ChromeExtensionServiceTest(prev, ext, cs);
prev = prev.then(() => {
    yt.player.unmount();
});
