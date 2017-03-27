import * as React from 'react';
import * as ReactDOM from "react-dom";
import { SketchPicker, ColorResult, RGBColor } from 'react-color'
const Color = require('color');

export interface ColorPickerProps {
    defaultColor: Color.Color;
    onColorChange: (color: Color.Color) => void;
    className: string;
}

export interface ColorPickerState {
    displayColorPicker: boolean,
    color: RGBColor;
}

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {

    private pickerCover: HTMLElement;

    constructor(props: ColorPickerProps) {
        super(props);
        const c = props.defaultColor.object();
        this.state = { color: { r: c.r, g: c.g, b: c.b, a: 1 }, displayColorPicker: false };
        //this.setState({color: props.defaultColor, displayColorPicker: false});
    }


    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false });
    };

    handleChange = (color: ColorResult) => {
        this.setState({ color: color.rgb });
        this.pickerCover.style.background = `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`;
        this.props.onColorChange(Color(color.hex));

    };

    //SEEDED: alpha channel
    render() {
        const picker = (
            <div className="cp-popover">
                <div className="cp-cover" onClick={this.handleClose} />
                <SketchPicker disableAlpha={false} color={this.state.color} onChange={this.handleChange} />
            </div>
        );

        const p = (
            <div className={this.props.className}>
                <div className="cp-swatch" onClick={this.handleClick} title="__MSG_Color__">
                    <div className="cp-color" style={{ background: this.state.color }} ref={(e) => { this.pickerCover = e; }} />
                </div>
                {this.state.displayColorPicker ? picker : null}
            </div>
        );
        return p;
    }
}