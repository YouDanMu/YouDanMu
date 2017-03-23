import { VideoService } from './VideoService';
import { RenderService } from './RenderService';
import { SettingsService } from './SettingsService';
import { ExtensionService } from './ExtensionService';
import { SettingsView } from './View';

export class YouDanMu {
    videoService: VideoService;
    renderService: RenderService;
    extensionService: ExtensionService;
    settingsService: SettingsService;
    settingsView: SettingsView;
}
