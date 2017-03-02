import { YouDanMu } from '.';
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
ydm.danmakuService = new BilibiliDanmakuService(ydm);
ydm.extensionService = new ChromeExtensionService(ydm);

(<any>window).ydm = ydm;
