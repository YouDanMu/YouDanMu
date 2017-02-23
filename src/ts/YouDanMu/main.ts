class App {
    constructor() {
        // Currently we don't support video in iframe
        if (this.inIframe()) return;
        window.addEventListener('message', this.messageHandler);
        let req = new XMLHttpRequest();
        req.open('get', chrome.extension.getURL('js/content-script.js'), true);
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

    messageHandler(event: any): void {
        if (event.source != window) return;
        if (event.data.type && (event.data.type == 'FROM_PAGE')) {
            console.log('[Master]:', event.data);
        }
    }

    i18n(str: string): string {
        return str.replace(/__MSG_(\w+)__/g, function (match: string, key: string) {
            return key ? chrome.i18n.getMessage(key) : '';
        });
    }

    inject(func: any): void {
        let p = document.body || document.head || document.documentElement;
        if (!p) {
            setTimeout(this.inject.bind(this, func), 0);
            return;
        }
        let script = document.createElement('script');
        script.id = 'ydm-content-script';
        script.setAttribute('type', 'text/javascript');
        script.appendChild(document.createTextNode(this.i18n('(function(){' + func.toString() + '})();')));
        p.appendChild(script);
    }
}

new App();
