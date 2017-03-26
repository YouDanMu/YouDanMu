import { Logger } from './util';
import { ChromeExtensionService } from './ExtensionService';

class App {
    ext = new ChromeExtensionService();

    constructor() {
        this.ext.storageGet(null).then(s => this.setLoggerLevel(s.devMode))
        this.ext.storageChanged.subscribe(changes => {
            if (Object.prototype.hasOwnProperty.call(changes, 'devMode')) {
                this.setLoggerLevel(changes['devMode'].newValue);
            }
        });
        let req = new XMLHttpRequest();
        req.open('get', chrome.extension.getURL('js/YouDanMu.js'), true);
        req.onload = () => this.inject(req.responseText);
        req.send();
    }

    private setLoggerLevel = (devMode: boolean): void => {
        if (devMode) {
            Logger.debugLevel = 3;
        } else {
            Logger.debugLevel = 0;
        }
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
