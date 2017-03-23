import { YouDanMu } from '../../';
import { Settings } from './Settings';
import { Poster } from './Poster';
import { ColorPicker} from './ColorPicker';
import { h, render, Component } from 'preact';

export class SettingsView {
    private ydm: YouDanMu;
    private parent: HTMLElement;
    private content: HTMLElement;
    private shown: boolean;
    private closeBtn: JSX.Element;
    
    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        this.parent = document.createElement('div');
        this.parent.classList.add('ydm-popup');
        this.shown = false;

        this.closeBtn = <a class="close" onClick={() => this.hide()}>&times;</a>
        render(this.closeBtn,this.parent);
        this.content = document.createElement('div');
        this.content.classList.add('content');
        this.parent.appendChild(this.content);
        render(<ColorPicker defaultColor="#000000" />, this.content);
        render(<Poster ydm={ydm} show={true} />,this.content);
        render(<Settings ydm={ydm} />, this.content);
    }

    toggle() {
        if (this.shown) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        this.shown = true;
        document.body.appendChild(this.parent);
        this.parent.classList.add('show');

    }

    hide() {
        this.shown = false;
        this.parent.classList.remove('show');
        //this.parent.remove();
    }
}
