export interface ExtensionService {
    sendCommandToInjected(type: string, data: any): Promise<any>;

    sendCommandToBackground(type: string, data: any): Promise<any>;

    storageGet({ keys, namespace }: {
        keys: string | string[] | Object | null,
        namespace?: 'sync' | 'local' | 'managed'
    }): Promise<{ [key: string]: any }>;

    storageSet({ items, namespace }: {
        items: {
            [key: string]: any
        },
        namespace?: 'sync' | 'local' | 'managed'
    }): Promise<void>;

    storageRemove({ keys, namespace }: {
        keys: string | string[],
        namespace?: 'sync' | 'local' | 'managed'
    }): Promise<void>;

    storageClear({ namespace }: {
        namespace?: 'sync' | 'local' | 'managed'
    }): Promise<void>;
}

export * from './ChromeExtensionService';
