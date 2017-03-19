import { YouDanMu } from '.';
import { SVGRenderService } from './RenderService';
import { YouTubeVideoService } from './VideoService';
import { BilibiliDanmakuService } from './DanmakuService';
import { ChromeExtensionService } from './ExtensionService';
import { Logger } from './util';

// Enable development level logging
Logger.debugLevel = 3;

const console = new Logger('Main');

/* If the injection succeeded, this line should print to the console. */
console.log(0, '__MSG_YDM_welcome_log__');

const ydm = new YouDanMu();
ydm.videoService = new YouTubeVideoService(ydm);
ydm.extensionService = new ChromeExtensionService(ydm);
ydm.renderService = new SVGRenderService(ydm);

const danmakuService = new BilibiliDanmakuService(ydm);
const stream = danmakuService.fetchByUrl('https://www.bilibili.com/video/av8898537');

stream.subscribe(d => ydm.renderService.loadDanmaku(d));

(<any>window).ydm = ydm;
