import { YouTube } from '../stub/YouTube-stub';

export namespace videoData {
    export const empty: YouTube.VideoData = {
        author: '',
        title: '',
        video_id: undefined,
        video_quality: undefined
    };
    export const v1: YouTube.VideoData = {
        author: "公式ピコ太郎歌唱ビデオチャンネル -PIKOTARO OFFICIAL CHANNEL-",
        title: "PPAP（Pen-Pineapple-Apple-Pen Official）”LONG” ver. ペンパイナッポーアッポーペン「ロング」バージョン／PIKOTARO(ピコ太郎)",
        video_id: "HFlgNoUsr4k",
        video_quality: "hd1080"
    };
    export const v2: YouTube.VideoData = {
        author: "京川魁",
        title: "【誤解向MAD】用大片的方式打開小林家的龍女僕",
        video_id: "Zz_4hChkOtk",
        video_quality: "hd720"
    };
}
