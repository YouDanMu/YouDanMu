import { YouDanMu } from '../YouDanMu';
import { SettingsService, Settings } from '../YouDanMu/SettingsService';

import { ContentScript } from './stub';

const { expect } = chai;

export function SettingsServiceTest(prev: Promise<any>, ydm: YouDanMu, cs: ContentScript): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('SettingsService', () => {

            let ss: SettingsService;

            if (prev) before(done => void prev.then(done));

            after(() => resolve());

            it('should initialize with default settings and get synced storage', (done) => {
                const settings: Settings = {
                    enable: false,
                    devMode: false,
                    opacity: 0.75
                };
                const sub = cs.onCommand.subscribe(m => {
                    sub.unsubscribe();
                    const { timestamp } = m;
                    if (m.type === 'storageGet') {
                        cs.sendEvent({ type: m.type, data: settings, timestamp });
                    } else {
                        cs.sendEvent({ type: m.type, data: null, error: `Unkown command ${m.type}`, timestamp });
                    }
                });
                ydm.settingsService = ss = new SettingsService(ydm);
                let count = 0;
                const sub2 = ss.settings.subscribe(s => {
                    switch (++count) {
                        case 1:
                            expect(s).to.eql({
                                enable: true,
                                devMode: true,
                                opacity: 1
                            });
                            break;
                        case 2:
                            sub2.unsubscribe();
                            expect(s).to.eql(settings);
                            done();
                            break;
                    }
                });
            });

            it('should be able to sync changes to `enable`', (done) => {
                const sub = cs.onCommand.subscribe(m => {
                    sub.unsubscribe();
                    const { timestamp } = m;
                    if (m.type === 'storageSet') {
                        try {
                            cs.sendEvent({ type: m.type, data: null, timestamp });
                            expect(m.data).to.eql([{ enable: true }, 'sync']);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    } else {
                        const error = `Unkown command ${m.type}`;
                        cs.sendEvent({ type: m.type, data: null, error, timestamp });
                        done(error);
                    }
                });
                ss.setEnable(true);
                expect(ss.settings.value.enable).to.be.true;
            });

            it('should be able to sync changes to `devMode`', (done) => {
                const sub = cs.onCommand.subscribe(m => {
                    sub.unsubscribe();
                    const { timestamp } = m;
                    if (m.type === 'storageSet') {
                        try {
                            cs.sendEvent({ type: m.type, data: null, timestamp });
                            expect(m.data).to.eql([{ devMode: true }, 'sync']);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    } else {
                        const error = `Unkown command ${m.type}`;
                        cs.sendEvent({ type: m.type, data: null, error, timestamp });
                        done(error);
                    }
                });
                ss.setDevMode(true);
                expect(ss.settings.value.devMode).to.be.true;
            });

            it('should be able to sync changes to `opacity`', (done) => {
                const sub = cs.onCommand.subscribe(m => {
                    sub.unsubscribe();
                    const { timestamp } = m;
                    if (m.type === 'storageSet') {
                        try {
                            cs.sendEvent({ type: m.type, data: null, timestamp });
                            expect(m.data).to.eql([{ opacity: 0.8 }, 'sync']);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    } else {
                        const error = `Unkown command ${m.type}`;
                        cs.sendEvent({ type: m.type, data: null, error, timestamp });
                        done(error);
                    }
                });
                ss.setOpacity(0.8);
                expect(ss.settings.value.opacity).to.be.true;
            });

            it('should be able to capture storage changes from other content scripts', (done) => {
                const changes: { [key: string]: chrome.storage.StorageChange } = {
                    opacity: {
                        oldValue: 0.8,
                        newValue: 0.75
                    }
                };
                let count = 0;
                const sub = ss.settings.subscribe((s) => {
                    if (++count === 2) {
                        sub.unsubscribe();
                        try {
                            expect(s.opacity).to.equal(0.75);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    }
                });
                cs.sendCommand('onStorageChanged', [changes]);
            })

        });
    });
}