import { YouDanMu, YDMSession } from '.';
import { SettingsView } from './View';
import { SettingsService } from './SettingsService';
import { SVGRenderService } from './RenderService';
import { BilibiliDanmakuService } from './DanmakuService';
import { ChromeExtensionService } from './ExtensionService';
import { YouTubeVideoService, PlayerEvent, PlayerState } from './VideoService';
import { Logger } from './util';

const console = new Logger('Main');

/* If the injection succeeded, this line should print to the console. */
console.log(0, '__MSG_YDM_welcome_log__');

const setLoggerLevel = (devMode: boolean) => {
    if (devMode) {
        // Enable development level logging
        Logger.debugLevel = 3;
    } else {
        // Disable development level logging
        Logger.debugLevel = 0;
    }
};

const ydm = new YouDanMu();

ydm.extensionService = new ChromeExtensionService(ydm);
ydm.settingsService = new SettingsService(ydm);

ydm.settingsService.settings.subscribe(({ devMode }) => {
    setLoggerLevel(devMode);
});

ydm.videoService = new YouTubeVideoService(ydm);
ydm.settingsView = new SettingsView(ydm);
ydm.renderService = new SVGRenderService(ydm);

ydm.videoService.event.subscribe(event => {
    switch (event) {
        case PlayerEvent.ScreenInit:
        case PlayerEvent.Cue: {
            if (ydm.session == null) {
                ydm.session = new YDMSession(ydm);
            }
            break;
        }
        case PlayerEvent.DanmakuButton: {
            ydm.settingsView.toggle();
            break;
        }
    }
});

ydm.videoService.state.subscribe(state => {
    switch (state) {
        case PlayerState.Idle: {
            if (ydm.session) {
                ydm.session = void ydm.session.destroy();
            }
            break;
        }
    }
});

(<any>window).ydm = ydm;
