import { YouDanMu } from '../../';
import { SettingsView as Settings } from './Settings';
import * as React from 'react';
import * as ReactDOM from "react-dom";

export class SettingsView {
    private ydm: YouDanMu;
    private parent: HTMLElement;
    private shown = false;
    private view: Settings;

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.parent = document.createElement('div');
        this.parent.classList.add('ydm-settings');
        this.parent.classList.add('ydm-toggleable-hidden');
        ReactDOM.render(
            <Settings
                ydm={ydm}
                onClose={this.hide}
                onLoadDanmaku={(url) => ydm.session.loadDanmaku(url)}
                onUnloadDanmaku={() => ydm.session.unloadDanmaku()}
                onPostDanmaku={(d) => ydm.session.postDanmaku(d)}
            />
            , this.parent
        );
    }

    toggle = (): void => {
        if (this.shown) {
            this.hide();
        } else {
            this.show();
        }
    }

    show = (): void => {
        if (this.shown) return;
        this.shown = true;
        document.body.appendChild(this.parent);
        this.parent.classList.remove('ydm-toggleable-hide');
        this.parent.classList.remove('ydm-toggleable-hidden');
        this.parent.classList.add('ydm-toggleable-show');
    }

    hide = (): void => {
        if (!this.shown) return;
        this.shown = false;
        this.parent.classList.remove('ydm-toggleable-show');
        this.parent.classList.remove('ydm-toggleable-hidden');
        this.parent.classList.add('ydm-toggleable-hide');
    }
}
