import { YouDanMu } from '.';
import { SettingsView } from './View';
import { SVGRenderService } from './RenderService';
import { BilibiliDanmakuService } from './DanmakuService';
import { ChromeExtensionService } from './ExtensionService';
import { YouTubeVideoService, PlayerEvent } from './VideoService';
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
ydm.settingsView = new SettingsView(ydm);

ydm.videoService.event.subscribe(event => {
    switch (event) {
        case PlayerEvent.Cue: {
            const testURL = 'https://www.bilibili.com/video/av8898537';
            const danmakuService = new BilibiliDanmakuService(ydm);
            const stream = danmakuService.fetchByUrl(testURL);
            stream.subscribe(d => ydm.renderService.danmakuInput.next(d));
            break;
        }
        case PlayerEvent.DanmakuButton: {
            ydm.settingsView.toggle();
            break;
        }
    }
});

(<any>window).ydm = ydm;
