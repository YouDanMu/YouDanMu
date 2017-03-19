import { YouDanMu } from '..';
import { DanmakuService } from '.';
import { Danmaku, Mode } from '../Danmaku';
import { Logger } from '../util';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toArray';

const Color = require('color');
const console = new Logger('BilibiliService');

interface MetaData {
    page: string;
    pagename: string;
    cid: string;
}

function RRGGBB(color: number | string): Color.Color {
    const t = Number(color).toString(16).toUpperCase();
    const c = '#' + (Array(7).join('0') + t).slice(-6);
    return Color(c);
};

export class BilibiliDanmakuService implements DanmakuService {
    private ydm: YouDanMu;
    constructor(ydm: YouDanMu) {
        this.ydm = ydm;
    }

    fetchByUrl(url: string): Observable<Danmaku> {
        const matches = url.match(/https?:\/\/www\.bilibili\.com\/video\/av(\d+)(\/index_(\d+)\.html)?/);
        if (!matches) throw new Error('Invalid URL!');
        const aid = matches[1];
        const page = matches[3];
        const uri = `https://www.bilibili.com/widget/getPageList?aid=${aid}`;
        return Observable.fromPromise(this.ydm.extensionService
            .fetch(uri))
            .mergeMap((data): Observable<Danmaku> => {
                const json: MetaData[] = JSON.parse(data);
                if (!json || !json.length) throw new Error('Unable to fetch Bilibili meta data.');
                const found = json.find(m => !page || m.page == page);
                if (!found) throw new Error('Video page not found.');
                return this.fetchById(found.cid);
            });
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
        return {
            text: n.textContent,
            time: Number(info[0]),
            mode: [undefined,
                Mode.MARQUEE,
                Mode.MARQUEE,
                Mode.MARQUEE,
                Mode.BOTTOM,
                Mode.TOP
            ][Number(info[1])],
            size: info[2] + 'px',
            color: RRGGBB(Number(info[3]))
        };
    }
}
