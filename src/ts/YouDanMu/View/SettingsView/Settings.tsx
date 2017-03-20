import { YouDanMu } from '../../';
import { h, Component } from 'preact';

export interface SettingsProps {
    ydm: YouDanMu;
}

export class Settings extends Component<SettingsProps, any> {
    render(props: SettingsProps) {
        return <div>
            <h1>__MSG_SettingsViewTitle__</h1>
        </div>;
    }
}