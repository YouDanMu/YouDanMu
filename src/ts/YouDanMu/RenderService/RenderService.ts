import { Danmaku } from '../Danmaku';
import { Observer } from 'rxjs/Observer';

export interface RenderService {
    danmakuInput: Observer<Danmaku>;
}
