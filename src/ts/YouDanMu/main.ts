import { Logger } from './util';
import { ChromeExtensionService } from './ExtensionService';
import { YouTubeService } from './VideoService';

// Enable development level logging
Logger.debugLevel = 3;

const console = new Logger('Main');

/* If the injection succeeded, this line should print to the console. */
console.log(0, '__MSG_YDM_welcome_log__');

const ydmyt = new YouTubeService();
(<any>window).ydmyt = ydmyt;

const ydmext = new ChromeExtensionService();
(<any>window).ydmext = ydmext;
