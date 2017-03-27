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

document.addEventListener('DOMContentLoaded', () => {
    const yt = new YouTube.API();
    YouTubeVideoServiceTest(videoService, yt);
});
