export interface ExtensionService {
    sendCommandToInjected(type: string, data: any): Promise<any>;
    sendCommandToBackground(type: string, data: any): Promise<any>;
}

export * from './ChromeExtensionService';
