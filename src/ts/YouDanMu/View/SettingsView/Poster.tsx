import { YouDanMu } from '../../';
import { h, Component } from 'preact';

export interface PosterProps {
    ydm: YouDanMu;
    show: boolean;
}

export interface PosterState {
    show: boolean;
    text: string;
}

export class Poster extends Component<PosterProps,PosterState> {

    constructor(props: PosterProps) {
        super(props);
        this.state.show = props.show;
    }


    render(props: PosterProps) {
        return ( 
            <div class='ydm-poster'>
                <h1>__MSG_SettingsViewTitle__</h1>
            </div>
        );
    }
}