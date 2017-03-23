import { Settings } from '../SettingsService';
import { Observable } from 'rxjs/Observable';

export interface ExtensionService {
    settingsChanged: Observable<Map<string,any>>;
    fetch(input: RequestInfo, init?: RequestInit): Promise<string>;
    getSettings(): Promise<Settings>;
    setSetting(k: string, v: any): void;
}

export * from './ChromeExtensionService';
