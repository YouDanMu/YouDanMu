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
        console.log(3, 'Received message from injected:', m.type, m);
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
        console.log(3, 'Sending message to injected:', m.type, m);
        document.dispatchEvent(
            new CustomEvent(
                this.channel,
                { detail: m }));
    }
}

export class ChromeExtensionService implements ExtensionService {
    private rx = (new InjectedReceiver()).rx;
    private tx = (new InjectedTransmitter()).tx;
    private delayedMap = new Map<string, Delayed<any>>();

    constructor() {
        this.rx.subscribe((m: Message) => {
            if (this.delayedMap.has(m.timestamp)) {
                // Callback result for a command received from injected-script
                console.log(3, 'Received event from injected-script:', m.type, m);
                const delayed = this.delayedMap.get(m.timestamp);
                this.delayedMap.delete(m.timestamp);
                console.log(3, 'Sending event to background-script:', m.type, m);
                if (m.error != null) delayed.reject(m.error);
                else delayed.resolve(m.data);
            } else {
                // Command initiated from the injected-script
                console.log(3, 'Sending command to background-script:', m.type, m);
                chrome.runtime.sendMessage(m, (response: Message) => {
                    console.log(3, 'Received event from background-script:', response.type, response);
                    response.timestamp = m.timestamp;
                    this.tx.next(response);
                });
            }
        });

        chrome.runtime.onMessage.addListener((m: Message, sender, callback: Callback) => {
            console.log(3, 'Received command from background-script:', m.type, m);
            // Init command message
            m.timestamp = performance.now().toString();
            if (this.delayedMap.has(m.timestamp))
                throw new Error('Timestamp exists');
            this.delayedMap.set(m.timestamp, {
                resolve: (value) => {
                    callback({
                        type: m.type,
                        data: value,
                        error: null
                    });
                },
                reject: (error) => {
                    callback({
                        type: m.type,
                        data: null,
                        error: error
                    });
                }
            });
            console.log(3, 'Sending command to injected-script:', m.type, m);
            this.tx.next(m);
            // Return true to enable asynchronously callback
            // Refer: https://developer.chrome.com/extensions/messaging
            return true;
        });
    }
}
