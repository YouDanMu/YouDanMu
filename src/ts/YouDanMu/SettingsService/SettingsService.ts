import { YouDanMu } from '../';
import { Settings } from '.';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { objToMap } from '../util';

const defaults: Settings = {
    enable: false,
    devMode: false,
    opacity: 1
}

export class SettingsService {
    enable = new BehaviorSubject<boolean>(defaults.enable);
    devMode = new BehaviorSubject<boolean>(defaults.devMode);
    opacity = new BehaviorSubject<number>(defaults.opacity);

    private ydm: YouDanMu;

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        ydm.extensionService.settingsChanged.subscribe(this.onSettingsChanged);
        ydm.extensionService.storageGet(null).then(s => {
            this.onSettingsChanged(objToMap(s));
        });
    }

    setEnable(e: boolean) {
        this.setSetting('enable', e);
    }

    setDevMode(d: boolean) {
        this.setSetting('devMode', d);
    }

    setOpacity(o: number) {
        this.setSetting('opacity', o);
    }

    private setSetting = (k: string, v: any): void => {
        if ((<any>this)[k].value === v) return;
        (<any>this)[k].next(v);
        this.ydm.extensionService.storageSet({ [k]: v });
    }

    private onSettingsChanged = (changes: Map<string, any>): void => {
        changes.forEach((v, k) => {
            if ((<any>this)[k].value === v) return;
            (<any>this)[k].next(v);
        })
    }
}
