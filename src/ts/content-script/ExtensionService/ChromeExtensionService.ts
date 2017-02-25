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
            .subscribe(this.onReceive.bind(this));
    }

    private onReceive(e: CustomEvent): void {
        if (!e.detail) return void console.error(0, 'Received mal-formatted event:', e);
        const m = <Message>e.detail;
        console.log(3, 'Received message from injected:', m.type, m);
        this.rx.next(m);
    }
}

class InjectedTransmitter {
    tx = new Subject<Message>();

    private channel = 'YDM: content-script -> injected';

    constructor() {
        this.tx.subscribe(this.onTransmit.bind(this));
    }

    private onTransmit(m: Message): void {
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

    constructor() {
        this.rx.subscribe((m: Message) => {
            console.log(3, 'Sending message to background:', m.type, m);
            chrome.runtime.sendMessage(m, (response: Message) => {
                console.log(3, 'Received message from background:', response.type, response);
                response.timestamp = m.timestamp;
                this.tx.next(response);
            });
        });
    }
}
