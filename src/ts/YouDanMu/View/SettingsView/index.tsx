import { YouDanMu } from '../../';
import { Settings } from './Settings';
//import { ColorPicker } from './ColorPicker';
import { h, render } from 'preact';

export class SettingsView {
    private ydm: YouDanMu;
    private parent: HTMLElement;
    private shown = false;
    
    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.parent = document.createElement('div');
        this.parent.classList.add('ydm-settings');
        this.parent.classList.add('ydm-toggleable-hidden');
        //render(<ColorPicker defaultColor="rgb(255,0,0)" onChange={(c) => console.log(c)} />, this.parent);
        render(<Settings ydm={ydm} />, this.parent);
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
