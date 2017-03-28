import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

export interface Message {
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

export class ContentScript {
    onCommand = new Subject<Message>();

    private rx = (new InjectedReceiver()).rx;
    private tx = (new InjectedTransmitter()).tx;
    private delayedMap = new Map<string, Delayed<any>>();

    constructor() {
        this.rx.subscribe((m: Message) => {
            if (this.delayedMap.has(m.timestamp)) {
                // Callback result for a command received from injected-script
                console.log(3, 'Received event from injected-script:', m.type, m);
                const delayed = this.delayedMap.get(m.timestamp);
                if (delayed == null) {
                    throw new Error('No delayed promise is cached.');
                }
                this.delayedMap.delete(m.timestamp);
                console.log(3, 'Sending event to caller:', m.type, m);
                if (m.error != null) delayed.reject(m.error);
                else delayed.resolve(m.data);
            } else {
                // Command initiated from the injected-script
                console.log(3, 'Received command from injected-script:', m.type, m.data);
                this.onCommand.next(m);
            }
        });
    }

    sendCommand(type: string, data: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
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

    sendEvent(m: Message) {
        console.log(3, 'Sending event to injected-script:', m.type, m);
        this.tx.next(m);
    }
}