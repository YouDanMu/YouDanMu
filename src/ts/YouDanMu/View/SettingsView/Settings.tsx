import { YouDanMu } from '../../';
import { h, Component } from 'preact';

export interface SettingsProps {
    ydm: YouDanMu;
}

export class Settings extends Component<SettingsProps, any> {
    render(props: SettingsProps) {
        return <div className="ydm-settings-container">
            <div className="ydm-settings-title-bar">
                <div className="ydm-settings-title-bar-title">__MSG_SettingsViewTitle__</div>
                <div className="ydm-settings-close" onClick={() => props.ydm.settingsView.hide()}>
                    <svg viewBox="0 0 20 20">
                        <path fill="#333" d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"></path>
                    </svg>
                </div>
            </div>
            <div className="ydm-settings-part">
                <textarea name="ydm-danmaku-post-content" rows={3} className="ydm-danmaku-post-content" placeholder="__MSG_DanmakuContentPlaceholder__"></textarea>
                <div className="ydm-settings-controls">
                    <button className="ydm-settings-button">__MSG_Post__</button>
                </div>
            </div>
            <div className="ydm-settings-part">
                <input type="text" name="ydm-settings-danmaku-url" className="ydm-settings-danmaku-url" placeholder="__MSG_DanmakuURLPlaceholder__"/>
                <div className="ydm-settings-controls">
                    <button className="ydm-settings-button">__MSG_Load__</button>
                </div>
            </div>
            <div className="ydm-settings-part">
                <div className="ydm-settings-section-title">__MSG_Opacity__</div>
                <div className="ydm-settings-controls">
                    <input type="number" step={0.01} name="ydm-settings-opacity-value" className="ydm-settings-control-value"/>
                    <input type="range" step={0.01} name="ydm-settings-opacity-range" className="ydm-settings-control-range"/>
                </div>
            </div>
        </div>;
    }
}