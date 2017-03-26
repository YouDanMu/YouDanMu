import { YouDanMu } from '../../';
import { Settings } from '../../SettingsService';
import * as React from 'react';
import * as ReactDOM from "react-dom";

import { ColorPicker } from './ColorPicker';

import * as _ from 'underscore';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const Color = require('color');

export interface SettingsProps {
    ydm: YouDanMu;
    onClose: () => void;
}

export interface SettingsState {
    enable: boolean;
    devMode: boolean;
    opacity: number;
}

export class SettingsView extends React.Component<SettingsProps, SettingsState> {

    private ydm: YouDanMu;

    private sampledOpacity = new Subject<number>();

    constructor(props: SettingsProps) {
        super(props);
        const { ydm } = props;
        this.ydm = ydm;
        this.state = _.clone(ydm.settingsService.settings.value);
        this.sampledOpacity.sampleTime(200).subscribe(this.ydm.settingsService.setOpacity);
    }

    componentDidMount() {
        this.ydm.settingsService.settings.subscribe(this.onSettingsChanged);
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
                <div className={"ydm-settings-sections" + (this.state.enable ? '' : ' ydm-disabled')}>
                    <div className="ydm-settings-part">
                        <div className="ydm-settings-section-title">__MSG_PostDanmaku__</div>
                        <textarea name="ydm-danmaku-post-content" rows={3} className="ydm-danmaku-post-content" placeholder="__MSG_DanmakuContentPlaceholder__"></textarea>
                        <div className="ydm-settings-controls">
                            <div className="ydm-button">__MSG_POST__</div>
                            <div className="ydm-radio-group">
                                <input id="ydm-settings-post-position-top" name="ydm-settings-post-position" type="radio" />
                                <label htmlFor="ydm-settings-post-position-top" className="ydm-icon" title="__MSG_DanmakuPositionTop__" dangerouslySetInnerHTML={{
                                    __html: `<svg viewBox="0 0 15 15"><rect width="15" height="3" /><polygon points="8 3 12 9 9 8 8 15 8 15 7 8 4 9 8 3" /></svg>`
                                }}>
                                </label>
                                <input id="ydm-settings-post-position-bottom" name="ydm-settings-post-position" type="radio" />
                                <label htmlFor="ydm-settings-post-position-bottom" className="ydm-icon" title="__MSG_DanmakuPositionBottom__" dangerouslySetInnerHTML={{
                                    __html: `<svg viewBox="0 0 15 15"><rect y="12" width="15" height="3" /><polygon points="7 12 3 6 6 7 7 0 7 0 8 7 11 6 7 12" /></svg>`
                                }}>
                                </label>
                                <input id="ydm-settings-post-position-roll" name="ydm-settings-post-position" type="radio" checked />
                                <label htmlFor="ydm-settings-post-position-roll" className="ydm-icon" title="__MSG_DanmakuPositionMarquee__" dangerouslySetInnerHTML={{
                                    __html: `<svg viewBox="0 0 15 15"><rect width="15" height="3" /><rect y="5" width="8" height="3" /><rect x="11" y="5" width="4" height="3" /><polygon points="0 11 5 8 4 11 15 11 15 12 4 12 5 15 0 11" /></svg>`
                                }}>
                                </label>
                            </div>
                            <div className="ydm-radio-group">
                                <input id="ydm-settings-post-size-small" name="ydm-settings-post-size" type="radio" />
                                <label htmlFor="ydm-settings-post-size-small" title="__MSG_DanmakuSizeSmallFull__">__MSG_DanmakuSizeSmallAbbrv__</label>
                                <input id="ydm-settings-post-size-large" name="ydm-settings-post-size" type="radio" checked />
                                <label htmlFor="ydm-settings-post-size-large" title="__MSG_DanmakuSizeLargeFull__">__MSG_DanmakuSizeLargeAbbrv__</label>
                            </div>
                            <ColorPicker className="ydm-color-picker" defaultColor={{ r: 0, g: 0, b: 0, a: 1 }} onColorChange={(color) => console.log(color)} />

                        </div>
                        <div className="ydm-overlay"></div>
                    </div>
                    <div className="ydm-settings-part">
                        <div className="ydm-settings-section-title">__MSG_DanmakuSource__</div>
                        <input type="url" name="ydm-settings-danmaku-url" placeholder="__MSG_DanmakuURLPlaceholder__" />
                        <div className="ydm-settings-controls">
                            <button className="ydm-button">__MSG_Load__</button>
                            <button className="ydm-button">__MSG_Unload__</button>
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
