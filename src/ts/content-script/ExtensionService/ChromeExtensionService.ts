import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';

import { Logger } from '../util';
import { ExtensionService } from './';

const console = new Logger('ChromeExtensionService');

interface Message {
    type: string;
    data: any;
    error?: any;
    timestamp?: string;
}

class InjectedReceiver {
    rx = new Subject<Message>();

    private channel = 'YDM: injected -> content-script';

    constructor() {
        Observable.fromEvent(document, this.channel)
            .subscribe(this.onReceive);
    }

    private onReceive = (e: CustomEvent): void => {
        if (!e.detail) return void console.error(0, 'Received mal-formatted event:', e);
        const m = <Message>e.detail;
        this.rx.next(m);
    }
}

type Callback = (m: Message) => void;

interface Delayed<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

class InjectedTransmitter {
    tx = new Subject<Message>();

    private channel = 'YDM: content-script -> injected';

    constructor() {
        this.tx.subscribe(this.onTransmit);
    }

    private onTransmit = (m: Message): void => {
        document.dispatchEvent(
            new CustomEvent(
                this.channel,
                { detail: m }));
    }
}

export class ChromeExtensionService implements ExtensionService {
    storageChanged = new Subject<{ [key: string]: chrome.storage.StorageChange }>();

    private rx = (new InjectedReceiver()).rx;
    private tx = (new InjectedTransmitter()).tx;
    private delayedMap = new Map<string, Delayed<any>>();

    constructor() {
        this.rx.subscribe((m: Message) => {
            if (this.delayedMap.has(m.timestamp)) {
                // Callback result for a command received from injected-script
                console.log(3, 'Received event from injected-script:', m.type, m);
                this.sendEventToBackground(m);
            } else {
                // Command initiated from the injected-script
                console.log(3, 'Received command from injected-script:', m.type, m.data);
                this.dispatchCommandFromInjected(m.type, m.data, m.timestamp);
            }
        });

        chrome.runtime.onMessage.addListener(({ type, data }: Message, sender, callback: Callback): boolean => {
            console.log(3, 'Received command from background-script:', type, data);
            this.dispatchCommandFromBackground(type, data, callback);
            // Return true to enable asynchronously callback
            // Refer: https://developer.chrome.com/extensions/messaging
            return true;
        });

        chrome.storage.onChanged.addListener((changes, namespace) => {
            this.storageChanged.next(changes);
            this.sendCommandToInjected('onStorageChanged', [changes]);
        });
    }

    sendCommandToInjected(type: string, data: any[] = []): Promise<any> {
        return new Promise<any>((resolve, reject): void => {
            const timestamp = performance.now().toString();
            const m: Message = { type, data, timestamp };
            if (this.delayedMap.has(timestamp)) {
                return void reject('Timestamp exists');
            }
            this.delayedMap.set(timestamp, { resolve, reject });
            console.log(3, 'Sending command to injected-script:', type, data);
            this.tx.next(m);
        });
    }

    sendCommandToBackground(type: string, data: any[] = []): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const m: Message = { type, data };
            console.log(3, 'Sending command to background-script:', type, data);
            chrome.runtime.sendMessage(m, (response: Message) => {
                console.log(3, 'Received event from background-script:', response.type, response);
                if (response.error != null) {
                    reject(response.error)
                } else {
                    resolve(response.data);
                }
            });
        });
    }

    private sendEventToInjected(m: Message): void {
        console.log(3, 'Sending event to injected-script:', m.type, m);
        this.tx.next(m);
    }

    private sendEventToBackground(m: Message): void {
        const delayed = this.delayedMap.get(m.timestamp);
        if (delayed == null) {
            throw new Error('Cannot use sendEventToBackground if no delayed promise is cached.');
        }
        this.delayedMap.delete(m.timestamp);
        console.log(3, 'Sending event to background-script:', m.type, m);
        if (m.error != null) delayed.reject(m.error);
        else delayed.resolve(m.data);
    }

    private dispatchCommandFromInjected(type: string, data: any[] = [], timestamp: string): void {
        if (typeof (<any>this)[type] === 'function') {
            // The command can be resolved inside this content-script
            (<any>this)[type](...data)
                .then((data: any) => {
                    this.sendEventToInjected({ type, data, timestamp });
                })
                .catch((error: any) => {
                    this.sendEventToInjected({ type, data: null, error, timestamp });
                });
        } else {
            // The content-script cannot handle the command, redirect
            // to background script
            this.sendCommandToBackground(type, data)
                .then((data: any) => {
                    this.sendEventToInjected({ type, data, timestamp });
                })
                .catch((error: any) => {
                    this.sendEventToInjected({ type, data: null, error, timestamp });
                });
        }
    }

    private dispatchCommandFromBackground(type: string, data: any[] = [], callback: Callback): void {
        if (typeof (<any>this)[type] === 'function') {
            // The command can be resolved inside this content-script
            (<any>this)[type](...data)
                .then((data: any) => {
                    callback({ type, data });
                })
                .catch((error: any) => {
                    callback({ type, data: null, error });
                });
        } else {
            // The content-script cannot handle the command, redirect
            // to injected-script
            this.sendCommandToInjected(type, data)
                .then((data: any) => {
                    callback({ type, data });
                })
                .catch((error: any) => {
                    callback({ type, data: null, error });
                });
        }
    }

    storageGet(
        keys: string | string[] | Object | null,
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<{ [key: string]: any }> {
        return new Promise<any>((resolve, reject) => {
            chrome.storage[namespace].get(keys, (items) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
            });
        });
    }

    storageSet(
        items: { [key: string]: any },
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            chrome.storage[namespace].set(items, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    storageRemove(
        keys: string | string[],
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callback = () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            };
            // TypeScript cannot automatically deconstruct union types
            // Thus we need to use type guards to enforce it.
            if (typeof keys === 'string') {
                chrome.storage[namespace].remove(keys, callback);
            } else {
                chrome.storage[namespace].remove(keys, callback);
            }
        });
    }

    storageClear(
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            chrome.storage[namespace].clear(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
}
