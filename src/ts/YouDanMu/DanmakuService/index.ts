import { Danmaku } from '../Danmaku';
import { Observable } from 'rxjs/Observable';

export interface DanmakuService {
    fetchByUrl(url: string): Observable<Danmaku>;
}

export * from './BilibiliDanmakuService';
