import { h, Component } from 'preact';
import { SettingsView } from './index'

export interface ColorPickerProps {
  defaultColor: string;
  onChange: (color: string) => void;
  className: string;
}

export interface ColorPickerState {
  displayColorPicker: boolean,
  color: string;
}

export class ColorPicker extends Component<ColorPickerProps, ColorPickerState> {
  private svg: SVGSVGElement;
  private panel: HTMLElement;
  private panelShow: HTMLElement;
  private buttonShow: HTMLElement;
  private pickerMount: Element;

  constructor(props: ColorPickerProps) {
    super(props);
    this.state.color = props.defaultColor;
  }

  static rgb2Hex(rgb: string) {
    let match = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (match && match.length === 4) ? "#" +
      ("0" + parseInt(match[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(match[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(match[3], 10).toString(16)).slice(-2) : '';
  }

  static hex2Rgb(hex: string) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static hsv2Rgb(h: number, s: number, v: number) {
    // H [0, 1] S and V [0.0, 1.0].
    let i = Math.floor(h * 360.0 / 60.0) % 6;
    let f = h * 360.0 / 60.0 - Math.floor(h * 360.0 / 60.0);
    let p = v * (1 - s);
    let q = v * (1 - s * f);
    let t = v * (1 - (1 - f) * s);
    let rgb: number[];
    switch (i) {
      case 0: rgb = [v*255, t*255, p*255];
        break;
      case 1: rgb = [q*255, v*255, p*255];
        break;
      case 2: rgb = [p*255, v*255, t*255];
        break;
      case 3: rgb = [p*255, q*255, v*255];
        break;
      case 4: rgb = [t*255, p*255, v*255];
        break;
      case 5: rgb = [v*255, p*255, q*255];
    }
  }

  static percent_to_color = (x: number) => {
    let r: number[];
    if (x < 0.2) r = [255, Math.floor(255 * x / 0.2), 0];
    else if (x < 0.4) r = [Math.floor(255 * (1 - (x - 0.2) / 0.2)), 255, 0];
    else if (x < 0.6) r = [0, 255, Math.floor(255 * (x - 0.4) / 0.2)];
    else if (x < 0.8) r = [0, Math.floor(255 * (1 - (x - 0.6) / 0.2)), 255];
    else r = [Math.floor(255 * (x - 0.8) / 0.2), 0, 255];
    return r;
  }

  handleChange = (color: string) => {
    console.log("colorpicker change:" + color);
    this.setState({ color: color } as ColorPickerState);

  };

  handleClick = (e: MouseEvent) => {
    let point = this.svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    let cpt = point.matrixTransform(this.svg.getScreenCTM().inverse());
    let rgb = ColorPicker.percent_to_color(cpt.x / 800);
    this.setState({ color: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` } as ColorPickerState);

    this.buttonShow.style.background = this.state.color;
    this.panelShow.style.fill = this.state.color;
    console.log("[color-picker]: color changed to: " + this.state.color);
    this.props.onChange(this.state.color);
  }




  render(props: ColorPickerProps) {

    const picker = (
      <div className="color-picker">
        <svg ref={(e) => { this.svg = e as SVGSVGElement; }}
          viewBox="0 0 800 400" style={{ cursor: "crosshair" }}

          onClick={(e) => { this.handleClick(e); }}
          onMouseEnter={(e) => { this.panel.style.fill = "url(#rb)" }}
          onMouseLeave={(e) => { this.panel.style.fill = "none" }} >

          <g>
            <defs>
              <linearGradient id="rb">
                <stop offset="0%" stop-color="#ff0000"></stop>
                <stop offset="20%" stop-color="#ffff00"></stop>
                <stop offset="40%" stop-color="#00ff00"></stop>
                <stop offset="60%" stop-color="#00ffff"></stop>
                <stop offset="80%" stop-color="#0000ff"></stop>
                <stop offset="100%" stop-color="#ff00ff"></stop>
              </linearGradient>
            </defs>
            <rect ref={(e) => { this.panelShow = e as HTMLElement; }} fill={this.state.color} width="800" height="400" />
            <rect ref={(e) => { this.panel = e as HTMLElement; }} fill="none" y="100" width="800" height="300" />
          </g>
          <rect fill="none" stroke="#000" strokeWidth="10" width="800" height="400" />
        </svg>
      </div>
    )

    const p = (
      <div className={props.className}>
        <div className='cp-swatch' ref={(element) => this.pickerMount = element}
          onClick={(e) => { this.setState({ displayColorPicker: !this.state.displayColorPicker } as ColorPickerState) }}>
          <div className='cp-color' style={{ background: this.state.color }} ref={(e) => { this.buttonShow = e as HTMLElement; }} />
        </div>

        {this.state.displayColorPicker ? picker : null}
      </div>
    );
    return p;
  }

}
