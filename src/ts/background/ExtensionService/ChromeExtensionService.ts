import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';

import { Logger } from '../util';
import { ExtensionService } from './';

const console = new Logger('ChromeExtensionService');

export interface Message {
    type: string;
    data: any;
    error?: any;
}

type Callback = (m: Message) => void;

export class ChromeExtensionService implements ExtensionService {
    constructor() {
        chrome.contextMenus.create({
            title: chrome.i18n.getMessage('SettingsViewTitle'),
            onclick: this.onContextMenuClicked
        });

        chrome.browserAction.onClicked.addListener(this.onExtensionIconClicked);

        chrome.runtime.onMessage.addListener((m: Message, sender, callback: Callback) => {
            if (sender.tab == null)
                // Message sent from other extensions
                return void console.error(0, 'Received message from unknown sender:', sender, m);
            // Message sent from the content-script
            this.dispatchCommand(m, callback);
            // Return true to enable asynchronously callback
            // Refer: https://developer.chrome.com/extensions/messaging
            return true;
        });
    }

    sendCommand(tabId: number, cmd: string, data: any = null): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, {
                type: cmd,
                data: data
            }, (response: Message) => {
                if (response.error != null) {
                    reject(response.error);
                } else {
                    resolve(response.data);
                }
            });
        });
    }

    private dispatchCommand(m: Message, callback: Callback): void {
        console.log(3, 'Received command from content-script:', m.type, m);
        const respond = (m: Message) => {
            console.log(3, 'Sending event to content-script:', m.type, m);
            callback(m);
        };
        if (typeof (<any>this)[m.type] === 'function') {
            (<any>this)[m.type](m.data)
                .then((data: any) => {
                    respond({
                        type: m.type,
                        data: data,
                        error: null
                    });
                }).catch((error: any) => {
                    respond({
                        type: m.type,
                        data: null,
                        error: error
                    });
                });
        } else {
            const error = `Undefined command type "${m.type}"`;
            console.error(0, error, m);
            respond({
                type: m.type,
                data: null,
                error: `Undefined command type "${m.type}"`
            });
        }
    }

    private fetch({ input, init }: { input: RequestInfo, init?: RequestInit }, callback: Callback): Promise<string> {
        return fetch(input, init).then((response) => response.text());
    }

    private onExtensionIconClicked = (tab: chrome.tabs.Tab) => {
        console.log(3, 'YouDanMu extension icon clicked');
        this.sendCommand(tab.id, 'onExtensionIconClicked')
    }

    private onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
        console.log(3, 'YouDanMu context menu clicked');
        this.sendCommand(tab.id, 'onContextMenuClicked')
    }
}
