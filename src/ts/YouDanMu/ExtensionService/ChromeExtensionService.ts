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
            .subscribe(this.onReceive.bind(this));
    }

    private onReceive(e: CustomEvent): void {
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
        this.tx.subscribe(this.onTransmit.bind(this));
    }

    private onTransmit(m: Message): void {
        console.log(3, 'Sending message to content-script:', m.type, m);
        document.dispatchEvent(
            new CustomEvent(
                this.channel,
                { detail: m }));
    }
}

export class ChromeExtensionService implements ExtensionService {
    private rx = new Subject<Message>();
    private tx = new Subject<Message>();
    private delayedMap = new Map<string, Delayed<any>>();

    constructor() {
        (new ContentScriptReceiver()).rx
            .subscribe(this.onRx.bind(this));
        this.tx.map((m: Message) => {
            if (m.timestamp == null && m.delayed != null) {
                // Init command message
                m.timestamp = performance.now().toString();
                if (this.delayedMap.has(m.timestamp))
                    throw new Error('Timestamp exists');
                this.delayedMap.set(m.timestamp, m.delayed);
                delete m.delayed;
            }
            return m;
        }).subscribe((new ContentScriptTransmitter()).tx);
    }

    private onRx(m: Message) {
        if (this.delayedMap.has(m.timestamp)) {
            // Event received.
            m.delayed = this.delayedMap.get(m.timestamp);
            if (m.error != null) m.delayed.reject(m.error);
            else m.delayed.resolve(m.data);
        } else {
            // Command received.
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

    fetch(input: RequestInfo, init?: RequestInit): Promise<string> {
        return new Promise((resolve, reject) => {
            this.tx.next({
                type: 'fetch',
                data: { input, init },
                delayed: { resolve, reject }
            });
        });
    }
}
