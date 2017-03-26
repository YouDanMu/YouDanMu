import { VideoService } from './VideoService';
import { RenderService } from './RenderService';
import { SettingsService } from './SettingsService';
import { ExtensionService } from './ExtensionService';
import { BilibiliDanmakuService } from './DanmakuService';
import { SettingsView } from './View';
import { Danmaku } from './Danmaku';

export class YDMSession {
    private ydm: YouDanMu;
    private danmakuService: BilibiliDanmakuService;

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.danmakuService = new BilibiliDanmakuService(ydm);
    }

    destroy() {

    }

    loadDanmaku = (url: string) => {
        const { ydm, danmakuService } = this;
        ydm.renderService.clearDanmaku();
        danmakuService.fetchByUrl(url)
            .subscribe(ydm.renderService.addDanmaku, err => { throw err });
    }

    unloadDanmaku = () => {
        this.ydm.renderService.clearDanmaku();
    }

    postDanmaku = (d: Danmaku) => {
        console.log('Posting danmaku:', d);
        this.ydm.renderService.addDanmaku(d);
    }
}

export class YouDanMu {
    videoService: VideoService;
    renderService: RenderService;
    extensionService: ExtensionService;
    settingsService: SettingsService;
    settingsView: SettingsView;
    session: YDMSession;
}
