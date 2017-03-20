import { VideoService } from './VideoService';
import { RenderService } from './RenderService';
import { ExtensionService } from './ExtensionService';
import { SettingsView } from './View';

export class YouDanMu {
    videoService: VideoService;
    renderService: RenderService;
    extensionService: ExtensionService;
    settingsView: SettingsView;
}
