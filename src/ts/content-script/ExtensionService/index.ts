export interface ExtensionService {
    sendCommandToInjected(type: string, data: any): Promise<any>;

    sendCommandToBackground(type: string, data: any): Promise<any>;
    storageGet(
        keys: string | string[] | Object | null,
        namespace: 'sync' | 'local' | 'managed'
    ): Promise<{ [key: string]: any }>;

    storageSet(
        items: { [key: string]: any },
        namespace: 'sync' | 'local' | 'managed'
    ): Promise<void>;

    storageRemove(
        keys: string | string[],
        namespace: 'sync' | 'local' | 'managed'
    ): Promise<void>;

    storageClear(
        namespace: 'sync' | 'local' | 'managed'
    ): Promise<void>;
}

export * from './ChromeExtensionService';
