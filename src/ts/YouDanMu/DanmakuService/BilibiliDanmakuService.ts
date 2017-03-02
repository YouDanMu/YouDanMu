import { YouDanMu } from '..';
import { Danmaku } from '../Danmaku';
import { Logger } from '../util';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

const console = new Logger('BilibiliService');

export class BilibiliDanmakuService {
    private ydm: YouDanMu;
    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
    }

    fetchById(id: string): Observable<Danmaku> {
        return Observable.fromPromise(this.ydm.extensionService
            .fetch(`https://comment.bilibili.com/${encodeURIComponent(id)}.xml`))
            .mergeMap((data): Observable<Element> => {
                const xml = new DOMParser().parseFromString(data, "text/xml");
                return Observable.from(xml.querySelectorAll('i > d'));
            }).map((d) => this.parseDanmaku(d));
    }

    private parseDanmaku(n: Element): Danmaku {
        let info = n.getAttribute('p').split(',');
        let d = new Danmaku(
            n.textContent,
            Number(info[0]) * 1000,
            [undefined,
                Danmaku.MODE.MARQUEE,
                Danmaku.MODE.MARQUEE,
                Danmaku.MODE.MARQUEE,
                Danmaku.MODE.BOTTOM,
                Danmaku.MODE.TOP
            ][Number(info[1])]
        );
        d.size = Number(info[2]);
        d.color = Number(info[3]);
        d.create = new Date(Number(info[4]));
        d.pool = info[5];
        d.user = info[6];
        d.id = info[7];
        return d;
    }
}