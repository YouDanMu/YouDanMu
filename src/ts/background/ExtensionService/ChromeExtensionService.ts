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
            console.log(3, 'Received message from content-script:', m.type, m);
            this.dispatchCommand(m, callback);
            // Return true to enable asynchronously callback
            // Refer: https://developer.chrome.com/extensions/messaging
            return true;
        });
    }

    sendMessage(tabId: number, m: Message, callback?: (response: any) => void) {
        chrome.tabs.sendMessage(tabId, m, callback);
    }

    private dispatchCommand(m: Message, callback: Callback): void {
        if (typeof (<any>this)[m.type] === 'function')
            (<any>this)[m.type](m.data, (response: Message) => {
                console.log(3, 'Sending message to content-script:', response.type, response);
                callback(response);
            });
        else {
            const error = `Undefined command type "${m.type}"`;
            console.error(0, error, m);
            callback({
                type: m.type,
                data: null,
                error: `Undefined command type "${m.type}"`
            });
        }
    }

    private fetch(args: { input: RequestInfo, init?: RequestInit }, callback: Callback): void {
        fetch(args.input, args.init).then((response) => {
            response.text().then((data) => {
                callback({
                    type: 'fetch',
                    data: data,
                    error: null
                });
            });
        }).catch((error) => {
            callback({
                type: 'fetch',
                data: null,
                error: error
            });
        });
    }

    private onExtensionIconClicked = (tab: chrome.tabs.Tab) => {
        console.log(3, 'YouDanMu extension icon clicked');
        this.sendMessage(tab.id, {
            type: 'onExtensionIconClicked',
            data: null
        })
    }

    private onContextMenuClicked = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
        console.log(3, 'YouDanMu context menu clicked');
        this.sendMessage(tab.id, {
            type: 'onContextMenuClicked',
            data: null
        })
    }
}
