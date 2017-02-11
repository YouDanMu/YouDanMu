/* If the injection succeeded, this line should print to the console. */
console.log('__MSG_YDM_welcome_log__');

import { YDM } from './YDM';

(<any>window).ydm = new YDM();
