import { YouDanMu } from '..';
import { Settings } from '../SettingsService';

import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';

import { Logger, objToMap } from '../util';
import { ExtensionService } from './';

const console = new Logger('ChromeExtensionService');

interface Message {
    type: string;
    data: any;
    error?: any;
    timestamp?: string;
    delayed?: Delayed<any>;
}

interface Delayed<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

class ContentScriptReceiver {
    rx = new Subject<Message>();

    private channel = 'YDM: content-script -> injected'

    constructor() {
        Observable.fromEvent(document, this.channel)
            .subscribe(this.onReceive);
    }

    private onReceive = (e: CustomEvent): void => {
        if (!e.detail) return void console.error(0, 'Received mal-formatted event:', e);
        const m = <Message>e.detail;
        console.log(3, 'Received message from content-script:', m.type, m);
        this.rx.next(m);
    }
}

class ContentScriptTransmitter {
    tx = new Subject<Message>();

    private channel = 'YDM: injected -> content-script';

    constructor() {
        this.tx.subscribe(this.onTransmit);
    }

    private onTransmit = (m: Message): void => {
        console.log(3, 'Sending message to content-script:', m.type, m);
        document.dispatchEvent(
            new CustomEvent(
                this.channel,
                { detail: m }));
    }
}

export class ChromeExtensionService implements ExtensionService {
    settingsChanged = new Subject<Map<string, any>>();

    private ydm: YouDanMu;
    private rx = new ContentScriptReceiver().rx;
    private tx = new ContentScriptTransmitter().tx;
    private delayedMap = new Map<string, Delayed<any>>();

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
    }

    sendCommand(type: string, data?: any): Promise<any> {
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

    fetch(input: RequestInfo, init?: RequestInit): Promise<string> {
        return this.sendCommand('fetch', { input, init });
    }

    storageGet(
        keys: string | string[] | Object | null,
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<{ [key: string]: any }> {
        return this.sendCommand('storageGet', { keys, namespace });
    }

    storageSet(
        items: { [key: string]: any },
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<void> {
        return this.sendCommand('storageSet', { items, namespace });
    }

    storageRemove(
        keys: string | string[],
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<void> {
        return this.sendCommand('storageRemove', { keys, namespace });
    }

    storageClear(
        namespace: 'sync' | 'local' | 'managed' = 'sync'
    ): Promise<void> {
        return this.sendCommand('storageClear', { namespace });
    }

    private onRx = (m: Message) => {
        if (this.delayedMap.has(m.timestamp)) {
            // Event received.
            console.log(3, 'Received event from injected-script:', m.type, m);
            m.delayed = this.delayedMap.get(m.timestamp);
            this.delayedMap.delete(m.timestamp);
            if (m.error != null) m.delayed.reject(m.error);
            else m.delayed.resolve(m.data);
        } else {
            // Command received.
            console.log(3, 'Received command from injected-script:', m.type, m.data);
            (new Promise((resolve, reject) => {
                try {
                    resolve((<any>this)[m.type](m.data));
                } catch (error) {
                    reject(error);
                }
            }))
                .then((data) => {
                    this.tx.next({
                        data: data,
                        error: null,
                        type: m.type,
                        timestamp: m.timestamp
                    });
                }).catch((error) => {
                    this.tx.next({
                        data: null,
                        error: error,
                        type: m.type,
                        timestamp: m.timestamp
                    });
                });
        }
    }

    private sendEvent(m: Message): void {
        console.log(3, 'Sending event to injected-script:', m.type, m);
        this.tx.next(m);
    }

    private onSettingsChanged = ({ changes }: { changes: { [key: string]: any } }): void => {
        this.settingsChanged.next(objToMap(changes));
    }

    private onExtensionIconClicked = () => {
        this.ydm.settingsView.toggle();
    }

    private onContextMenuClicked = () => {
        this.ydm.settingsView.show();
    }
}
