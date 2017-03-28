import { ChromeExtensionService } from '../YouDanMu/ExtensionService';

import { ContentScript } from './stub';

const { expect } = chai;

export function ChromeExtensionServiceTest(prev: Promise<any>, ext: ChromeExtensionService, cs: ContentScript): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        describe('ExtensionService/ChromeExtensionService', () => {

            if (prev) before(done => void prev.then(done));

            after(() => resolve());

            it('should be able to send command to content script', () => {
                expect('a').to.equal('a');
            });

        });
    });
}