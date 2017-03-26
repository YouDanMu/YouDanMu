import { YouDanMu } from '../';
import { Settings } from '.';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import * as _ from 'underscore';

const defaults: Settings = {
    enable: true,
    devMode: true,
    opacity: 1
}

export class SettingsService {
    settings = new BehaviorSubject<Settings>(defaults);

    private ydm: YouDanMu;

    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
        ydm.extensionService.storageChanged.subscribe(this.onStorageChanged);
        ydm.extensionService.storageGet(null).then(this.change);
    }

    setEnable = (e: boolean) => {
        this.setSetting('enable', e);
    }

    setDevMode = (d: boolean) => {
        this.setSetting('devMode', d);
    }

    setOpacity = (o: number) => {
        this.setSetting('opacity', o);
    }

    private setSetting = (k: keyof Settings, v: any): void => {
        const settings = _.clone(this.settings.value);
        if (settings[k] === v) return;
        settings[k] = v;
        this.settings.next(settings);
        this.ydm.extensionService.storageSet({ [k]: v });
    }

    private change = (changes: { [key: string]: any }) => {
        const newValues = _.clone(this.settings.value);
        let changed = false;
        for (let k of ['enable', 'devMode', 'opacity']) {
            if (Object.prototype.hasOwnProperty.call(changes, k)) {
                if (changes[k] !== (<any>newValues)[k]) {
                    changed = true;
                }
                (<any>newValues)[k] = changes[k];
            }
        }
        if (changed) {
            this.settings.next(newValues);
        }
    }

    private onStorageChanged = (changes: { [key: string]: chrome.storage.StorageChange }): void => {
        const newValues: { [key: string]: string } = {};
        for (let k in changes) {
            newValues[k] = changes[k].newValue;
        }
        this.change(newValues);
    }
}
