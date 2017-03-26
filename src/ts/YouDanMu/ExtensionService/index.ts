import { Settings } from '../SettingsService';
import { Observable } from 'rxjs/Observable';

export interface ExtensionService {
    storageChanged: Observable<{ [key: string]: chrome.storage.StorageChange }>;

    sendCommand(type: string, data?: any): Promise<any>;

    fetch(input: RequestInfo, init?: RequestInit): Promise<string>;

    storageGet(
        keys: string | string[] | Object | null,
        namespace?: 'sync' | 'local' | 'managed'
    ): Promise<{ [key: string]: any }>;

    storageSet(
        items: { [key: string]: any },
        namespace?: 'sync' | 'local' | 'managed'
    ): Promise<void>;

    storageRemove(
        keys: string | string[],
        namespace?: 'sync' | 'local' | 'managed'
    ): Promise<void>;

    storageClear(
        namespace?: 'sync' | 'local' | 'managed'
    ): Promise<void>;
}

export * from './ChromeExtensionService';
