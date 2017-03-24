import { YouDanMu } from '.';
import { SettingsView } from './View';
import { SettingsService } from './SettingsService';
import { SVGRenderService } from './RenderService';
import { BilibiliDanmakuService } from './DanmakuService';
import { ChromeExtensionService } from './ExtensionService';
import { YouTubeVideoService, PlayerEvent } from './VideoService';
import { Logger } from './util';

const console = new Logger('Main');

/* If the injection succeeded, this line should print to the console. */
console.log(0, '__MSG_YDM_welcome_log__');

const ydm = new YouDanMu();

ydm.extensionService = new ChromeExtensionService(ydm);
ydm.settingsView = new SettingsView(ydm);
ydm.settingsService = new SettingsService(ydm);

ydm.settingsService.devMode.subscribe(devMode => {
    if (devMode) {
        // Enable development level logging
        Logger.debugLevel = 3;
    } else {
        // Disable development level logging
        Logger.debugLevel = 0;
    }
});

ydm.videoService = new YouTubeVideoService(ydm);
ydm.renderService = new SVGRenderService(ydm);

ydm.videoService.event.subscribe(event => {
    switch (event) {
        case PlayerEvent.Cue: {
            const testURL = 'https://www.bilibili.com/video/av8898537';
            const danmakuService = new BilibiliDanmakuService(ydm);
            const stream = danmakuService.fetchByUrl(testURL);
            stream.subscribe(ydm.renderService.addDanmaku);
            break;
        }
        case PlayerEvent.DanmakuButton: {
            ydm.settingsView.toggle();
            break;
        }
    }
});

(<any>window).ydm = ydm;
