import { YouTube } from './stub/YouTube-stub';
import './Danmaku-spec';
import './Segments-spec';

let yt = new YouTube.API();
setTimeout(() => {
    document.getElementById('movie-outter')
        .appendChild(yt.player.e);
}, 100);
