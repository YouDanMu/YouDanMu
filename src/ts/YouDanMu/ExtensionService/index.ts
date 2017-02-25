import { Observable } from 'rxjs/Observable';

export interface ExtensionService {
    fetch(input: RequestInfo, init?: RequestInit): Promise<string>;
}

export * from './ChromeExtensionService';
