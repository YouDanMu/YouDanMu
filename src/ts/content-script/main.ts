import { Logger } from './util';
import { ChromeExtensionService } from './ExtensionService';

Logger.debugLevel = 3;

class App {
    ext = new ChromeExtensionService();
    
    constructor() {
        // Currently we don't support video in iframe
        if (this.inIframe()) return;
        let req = new XMLHttpRequest();
        req.open('get', chrome.extension.getURL('js/YouDanMu.js'), true);
        req.onload = () => this.inject(req.responseText);
        req.send();
    }

    inIframe(): boolean {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    i18n(str: string): string {
        return str.replace(/__MSG_(\w+)__/g, function (match: string, key: string) {
            return key ? chrome.i18n.getMessage(key) : '';
        });
    }

    inject(func: any): void {
        let p = document.body || document.head || document.documentElement;
        if (!p)
            return void setTimeout(this.inject.bind(this, func), 0);
        let script = document.createElement('script');
        script.id = 'ydm-content-script';
        script.setAttribute('type', 'text/javascript');
        script.appendChild(document.createTextNode(this.i18n('(function(){' + func.toString() + '})();')));
        p.appendChild(script);
    }
}

new App();
