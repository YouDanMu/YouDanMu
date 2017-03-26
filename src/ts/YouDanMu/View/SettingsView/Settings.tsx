import { YouDanMu } from '../../';
import { PlayerEvent } from '../../VideoService';
import { Settings } from '../../SettingsService';
import { ColorPicker } from './ColorPicker';
import { Danmaku, Mode } from '../../Danmaku';

import * as React from 'react';
import * as ReactDOM from "react-dom";
import * as _ from 'underscore';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const Color = require('color');

const SMALL_SIZE = '18px';
const LARGE_SIZE = '25px';

export interface SettingsProps {
    ydm: YouDanMu;
    onClose: () => void;
    onLoadDanmaku: (url: string) => void;
    onUnloadDanmaku: () => void;
    onPostDanmaku: (d: Danmaku) => void;
}

export interface SettingsState {
    enable: boolean;
    devMode: boolean;
    opacity: number;
    cued: boolean;
    danmakuURL: string;
    danmakuURLError: string;
    postText: string;
    postTextError: string;
    postMode: Mode;
    postSize: string;
    postColor: Color.Color;
}

export class SettingsView extends React.Component<SettingsProps, SettingsState> {

    private ydm: YouDanMu;

    private sampledOpacity = new Subject<number>();

    constructor(props: SettingsProps) {
        super(props);
        const { ydm } = props;
        this.ydm = ydm;

        const state: any = _.clone(ydm.settingsService.settings.value);
        _.extend(state, {
            cued: false,
            danmakuURL: '',
            danmakuURLError: '',
            postText: '',
            postTextError: '',
            postMode: Mode.MARQUEE,
            postSize: LARGE_SIZE,
            postColor: Color('#fff')
        });
        this.state = state;

        this.sampledOpacity.sampleTime(200).subscribe(this.ydm.settingsService.setOpacity);
        ydm.videoService.event.subscribe(this.onVideoEvent);
    }

    componentDidMount() {
        this.ydm.settingsService.settings.subscribe(this.onSettingsChanged);
    }

    private onVideoEvent = (event: PlayerEvent) => {
        switch (event) {
            case PlayerEvent.Cue:
                this.setState({ cued: true });
                break;
            case PlayerEvent.Uncue:
                this.setState({ cued: false });
                break;
        }
    }

    private onSettingsChanged = ({ enable, devMode, opacity }: Settings): void => {
        const state = { enable, devMode, opacity };
        this.setState(state);
    }

    private onEnableChanged = () => {
        this.ydm.settingsService.setEnable(!this.state.enable);
        this.setState({ enable: !this.state.enable });
    }

    private onDevModeChanged = () => {
        this.ydm.settingsService.setDevMode(!this.state.devMode);
        this.setState({ devMode: !this.state.devMode });
    }

    private onOpacityChanged = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
        const opacity = parseFloat(value);
        if (opacity < 0 || opacity > 1) return;
        this.sampledOpacity.next(opacity);
        this.setState({ opacity });
    }

    private onDanmakuURLChanged = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ danmakuURL: value, danmakuURLError: null });
    }

    private onLoadDanmaku = () => {
        const { danmakuURL } = this.state;
        if (!danmakuURL) {
            this.setState({ danmakuURLError: 'Please enter Danmaku URL.' });
        } else if (danmakuURL.match(/^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
            try {
                this.props.onLoadDanmaku(danmakuURL);
            } catch (e) {
                this.setState({ danmakuURLError: e.message });
            }
        } else {
            this.setState({ danmakuURLError: 'Invalid Danmaku URL.' });
        }
    }

    private onUnoadDanmaku = () => {
        this.props.onUnloadDanmaku();
    }

    private onPostTextChanged = ({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({ postText: value, postTextError: null });
    }

    private onPostSizeChanged = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ postSize: (value === 'small' ? SMALL_SIZE : LARGE_SIZE) });
    }

    private onPostModeChanged = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
        let mode: Mode;
        switch (value) {
            case 'marquee':
                mode = Mode.MARQUEE;
                break;
            case 'top':
                mode = Mode.TOP;
                break;
            case 'bottom':
                mode = Mode.BOTTOM;
                break;
        }
        this.setState({ postMode: mode });
    }

    private onPostColorChanged = (color: Color.Color) => {
        this.setState({ postColor: color });
    }

    private onPostDanmaku = () => {
        const { ydm, state } = this;
        const text = state.postText;
        if (text) {
            this.props.onPostDanmaku({
                text: text,
                time: ydm.videoService.getTime(),
                mode: state.postMode,
                size: state.postSize,
                color: state.postColor
            });
        } else {
            this.setState({ postTextError: 'Invalid content!' });
        }
    }

    render() {
        return (
            <div className="ydm-settings-container">
                <div className="ydm-settings-title-bar">
                    <div className="ydm-settings-title-bar-title">
                        <span>__MSG_SettingsViewTitle__</span>
                        <div className="ydm-cbx-btn">
                            <input type="checkbox" id="ydm-settings-enable" checked={this.state.enable} onChange={this.onEnableChanged} />
                            <label htmlFor="ydm-settings-enable" title={this.state.enable ? '__MSG_DisableDanmaku__' : '__MSG_EnableDanmaku__'}></label>
                        </div>
                    </div>
                    <div className="ydm-settings-close" onClick={this.props.onClose} dangerouslySetInnerHTML={{
                        __html: `<svg viewBox="0 0 20 20"><path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path></svg>`
                    }}></div>
                </div>
                <div className={'ydm-settings-sections' + (this.state.enable ? '' : ' ydm-disabled')}>
                    <div className={'ydm-settings-part' + (this.state.cued ? '' : ' ydm-disabled')}>
                        <div className="ydm-settings-section-title">__MSG_PostDanmaku__</div>
                        {this.state.postTextError ? <div className="ydm-tooltip ydm-tooltip-error">{this.state.postTextError}</div> : null}
                        <textarea onChange={this.onPostTextChanged} name="ydm-danmaku-post-content" rows={3} className="ydm-danmaku-post-content" placeholder="__MSG_DanmakuContentPlaceholder__"></textarea>
                        <div className="ydm-settings-controls">
                            <div className="ydm-button" onClick={this.onPostDanmaku}>__MSG_POST__</div>
                            <div className="ydm-radio-group">
                                <input
                                    id="ydm-settings-post-position-top"
                                    name="ydm-settings-post-position"
                                    type="radio"
                                    value="top"
                                    checked={this.state.postMode === Mode.TOP}
                                    onChange={this.onPostModeChanged} />
                                <label htmlFor="ydm-settings-post-position-top" className="ydm-icon" title="__MSG_DanmakuPositionTop__" dangerouslySetInnerHTML={{
                                    __html: `<svg viewBox="0 0 15 15"><rect width="15" height="3" /><polygon points="8 3 12 9 9 8 8 15 8 15 7 8 4 9 8 3" /></svg>`
                                }}>
                                </label>
                                <input
                                    id="ydm-settings-post-position-bottom"
                                    name="ydm-settings-post-position"
                                    type="radio"
                                    value="bottom"
                                    checked={this.state.postMode === Mode.BOTTOM}
                                    onChange={this.onPostModeChanged} />
                                <label htmlFor="ydm-settings-post-position-bottom" className="ydm-icon" title="__MSG_DanmakuPositionBottom__" dangerouslySetInnerHTML={{
                                    __html: `<svg viewBox="0 0 15 15"><rect y="12" width="15" height="3" /><polygon points="7 12 3 6 6 7 7 0 7 0 8 7 11 6 7 12" /></svg>`
                                }}>
                                </label>
                                <input
                                    id="ydm-settings-post-position-roll"
                                    name="ydm-settings-post-position"
                                    type="radio"
                                    value="marquee"
                                    checked={this.state.postMode === Mode.MARQUEE}
                                    onChange={this.onPostModeChanged} />
                                <label htmlFor="ydm-settings-post-position-roll" className="ydm-icon" title="__MSG_DanmakuPositionMarquee__" dangerouslySetInnerHTML={{
                                    __html: `<svg viewBox="0 0 15 15"><rect width="15" height="3" /><rect y="5" width="8" height="3" /><rect x="11" y="5" width="4" height="3" /><polygon points="0 11 5 8 4 11 15 11 15 12 4 12 5 15 0 11" /></svg>`
                                }}>
                                </label>
                            </div>
                            <div className="ydm-radio-group">
                                <input
                                    id="ydm-settings-post-size-small"
                                    name="ydm-settings-post-size"
                                    type="radio"
                                    value="small"
                                    checked={this.state.postSize === SMALL_SIZE}
                                    onChange={this.onPostSizeChanged} />
                                <label htmlFor="ydm-settings-post-size-small" title="__MSG_DanmakuSizeSmallFull__">__MSG_DanmakuSizeSmallAbbrv__</label>
                                <input
                                    id="ydm-settings-post-size-large"
                                    name="ydm-settings-post-size"
                                    type="radio"
                                    value="large"
                                    checked={this.state.postSize === LARGE_SIZE}
                                    onChange={this.onPostSizeChanged} />
                                <label htmlFor="ydm-settings-post-size-large" title="__MSG_DanmakuSizeLargeFull__">__MSG_DanmakuSizeLargeAbbrv__</label>
                            </div>
                            <ColorPicker className="ydm-color-picker" defaultColor={this.state.postColor} onColorChange={this.onPostColorChanged} />
                        </div>
                        <div className="ydm-overlay"></div>
                    </div>
                    <div className={'ydm-settings-part' + (this.state.cued ? '' : ' ydm-disabled')}>
                        <div className="ydm-settings-section-title">__MSG_DanmakuSource__</div>
                        <input type="url" name="ydm-settings-danmaku-url" placeholder="__MSG_DanmakuURLPlaceholder__" onChange={this.onDanmakuURLChanged} />
                        <div className="ydm-settings-controls">
                            <button className="ydm-button" onClick={this.onLoadDanmaku}>__MSG_Load__</button>
                            <button className="ydm-button" onClick={this.onUnoadDanmaku}>__MSG_Unload__</button>
                        </div>
                        <div className="ydm-overlay"></div>
                    </div>
                    <div className="ydm-settings-part">
                        <div className="ydm-settings-section-title">__MSG_Opacity__</div>
                        <div className="ydm-settings-controls">
                            <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.01}
                                value={this.state.opacity}
                                onChange={this.onOpacityChanged}
                                name="ydm-settings-opacity-value"
                                className="ydm-input-value" />
                            <input type="range" min={0} max={1} step={0.01} value={this.state.opacity} onChange={this.onOpacityChanged} name="ydm-settings-opacity-range" className="ydm-input-range" />
                        </div>
                        <div className="ydm-overlay"></div>
                    </div>
                    <div className="ydm-settings-part">
                        <div className="ydm-settings-section-title">
                            <span>__MSG_DeveloperMode__</span>
                            <div className="ydm-cbx-btn">
                                <input type="checkbox" id="ydm-settings-dev-enable" checked={this.state.devMode} onChange={this.onDevModeChanged} />
                                <label htmlFor="ydm-settings-dev-enable" title={this.state.devMode ? '__MSG_DisableDeveloperMode__' : '__MSG_EnableDeveloperMode__'}></label>
                            </div>
                        </div>
                        <div className="ydm-overlay"></div>
                    </div>
                    <div className="ydm-overlay"></div>
                </div>
            </div >
        );
    }
}
