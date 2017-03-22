import { YouDanMu } from '../../';
import { Settings } from './Settings';

import { h, render } from 'preact';

export class SettingsView {
    private ydm: YouDanMu;
    private parent: HTMLElement;
    private shown: boolean;
    
    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.parent = document.createElement('div');
        this.parent.classList.add('ydm-settings');
        render(<Settings ydm={ydm} />, this.parent);
    }

    toggle(): void {
        if (this.shown) {
            this.hide();
        } else {
            this.show();
        }
    }

    show(): void {
        if (this.shown) return;
        this.shown = true;
        document.body.appendChild(this.parent);
    }

    hide(): void {
        if (!this.shown) return;
        this.shown = false;
        this.parent.remove();
    }
}