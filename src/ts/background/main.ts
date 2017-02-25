import { Logger } from './util';
import { ChromeExtensionService } from './ExtensionService';

Logger.debugLevel = 3;

class App {
    ext = new ChromeExtensionService();

    constructor() {

    }
}

new App();
