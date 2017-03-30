import { YouDanMu } from '../YouDanMu';
import { Logger } from '../YouDanMu/util/Logger';
import { YouTubeVideoService } from '../YouDanMu/VideoService';
import { ChromeExtensionService } from '../YouDanMu/ExtensionService';
import { SVGRenderService } from '../YouDanMu/RenderService';
import { YouTube, ContentScript } from './stub';
import { SettingsService } from '../YouDanMu/SettingsService'

import { SegmentTest, SegmentsTest } from './Segments-spec';
import { YouTubeVideoServiceTest } from './YouTubeVideoService-spec';
import { ChromeExtensionServiceTest } from './ChromeExtensionService-spec';
import { SettingsServiceTest } from './SettingsService-spec';
import { SVGRenderServiceTest, SVGDanmakuTest, SVGCanvasTest } from './RenderService-spec';
import { IntervalTreeTest } from './IntervalTree-spec'

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
const ext = ydm.extensionService = new ChromeExtensionService(ydm);
const videoService = ydm.videoService = new YouTubeVideoService(ydm);
const settingService = ydm.settingsService = new SettingsService(ydm);
const renderService = ydm.renderService = new SVGRenderService(ydm);


let yt: { player: YouTube.Player } = {
    player: null
};

let prev: Promise<any>;

prev = initializeYouTubeAPI();
prev = YouTubeVideoServiceTest(prev, videoService, yt);
prev = SegmentTest(prev);
prev = SegmentsTest(prev);
prev = ChromeExtensionServiceTest(prev, ext, cs);
prev = SettingsServiceTest(prev, ydm, cs);
prev = IntervalTreeTest(prev);
prev = SVGDanmakuTest(prev);
prev = SVGCanvasTest(prev);
prev = SVGRenderServiceTest(prev,ydm,yt);
prev = prev.then(() => {
    yt.player.unmount();
});
