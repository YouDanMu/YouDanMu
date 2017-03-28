import { ChromeExtensionService } from '../YouDanMu/ExtensionService';

import { ContentScript } from './stub';

const { expect } = chai;

export function ChromeExtensionServiceTest(prev: Promise<any>, ext: ChromeExtensionService, cs: ContentScript): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('ExtensionService/ChromeExtensionService', () => {

            if (prev) before(done => void prev.then(done));

            after(() => resolve());

            it('should be able to send command to content script', (done) => {
                const type = 'some_command';
                const data: any[] = [1, 2, 'a', {
                    k: 123,
                    p: 'abc',
                    q: [4, 5, 6]
                }];
                const sub = cs.onCommand.subscribe(m => {
                    try {
                        sub.unsubscribe();
                        expect(m.type).to.equal(type);
                        expect(m.data).to.eql(data);
                        expect(m.error).to.be.undefined;
                        expect(parseInt(m.timestamp) - performance.now()).to.below(100);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
                ext.sendCommand(type, data);
            });

            it('should be able to receive event for command from content script', (done) => {
                const type = 'some_command';
                const data: any[] = [1, 2, 'a', {
                    k: 123,
                    p: 'abc',
                    q: [4, 5, 6]
                }];
                const sub = cs.onCommand.subscribe(({ type, timestamp }) => {
                    if (type === type) {
                        sub.unsubscribe();
                        cs.sendEvent({ type, data, timestamp });
                    } else {
                        cs.sendEvent({ type, data: null, error: `Unkown command ${type}`, timestamp });
                    }
                });
                ext.sendCommand(type, data).then(value => {
                    try {
                        expect(value).to.eql(data);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }).catch(e => {
                    done(e);
                });
            });

            it('should be able to receive error event for command from content script', (done) => {
                const type = 'some_command';
                const sub = cs.onCommand.subscribe(({ type, timestamp }) => {
                    sub.unsubscribe();
                    cs.sendEvent({ type, data: null, error: `Unkown command ${type}`, timestamp });
                });
                ext.sendCommand(type).then(value => {
                    done(`Expecting error, instead ${value} is received.`);
                }).catch(e => {
                    expect(e).equal(`Unkown command ${type}`);
                    done();
                });
            });

        });
    });
}