import { YouTubeService } from './VideoService';

/* If the injection succeeded, this line should print to the console. */
console.log('__MSG_YDM_welcome_log__');

const ydmyt = new YouTubeService();
(<any>window).ydmyt = ydmyt;

ydmyt.onCue.subscribe((video) => console.log('[YDM] Video Cued:', video));
ydmyt.onPause.subscribe((time) => console.log('[YDM] Video Paused:', time));
ydmyt.onPlay.subscribe((time) => console.log('[YDM] Video Played:', time));
ydmyt.onSpeedChange.subscribe((rate) => console.log('[YDM] Video Speed Changed:', rate));
ydmyt.onScreenDestroy.subscribe(() => console.log('[YDM] Screen Destroyed'));
ydmyt.onScreenInit.subscribe((screen) => console.log('[YDM] Screen Inited:', screen));
ydmyt.onScreenResize.subscribe((screen) => console.log('[YDM] Screen Resized:', screen));
ydmyt.onAdStart.subscribe(() => console.log('[YDM] Ad Started'));
ydmyt.onAdEnd.subscribe(() => console.log('[YDM] Ad Ended'));
