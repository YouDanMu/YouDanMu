import { h, Component } from 'preact';
import {SettingsView} from './index'

export interface ColorPickerProps {
  defaultColor: string;
}

export interface ColorPickerState {
  displayColorPicker: boolean,
  color: string;
}

export class ColorPicker extends Component<ColorPickerProps, ColorPickerState> {

  //private cp;
  //private picker;
  private svg: SVGSVGElement;
  private panel: HTMLElement;
  private pickerMount: Element;

  constructor(props: ColorPickerProps) {
    super(props);
    this.state.color = props.defaultColor;
  }

  static percent_to_color = (x: number) => {
    let r : number[];
    if(x<0.2) r = [255,Math.floor(255*x/0.2),0];
    else if(x<0.4) r = [Math.floor(255*(1-(x-0.2)/0.2)),255,0];
    else if(x<0.6) r =  [0,255,Math.floor(255*(x-0.4)/0.2)];
    else if(x<0.8) r = [0,Math.floor(255*(1-(x-0.6)/0.2)),255];
    else r = [Math.floor(255*(x-0.8)/0.2),0,255];
    return r;
  }

  handleChange = (color:string) => {
    console.log("colorpicker change:" + color);
    this.setState({ color: color } as ColorPickerState);

  };

  handleClick = (e : MouseEvent) => {
    //document.rootElement;
    this.svg = this.pickerMount.getElementsByClassName("picker-svg")[0] as SVGSVGElement;
    let point = this.svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    let cpt = point.matrixTransform(this.svg.getScreenCTM().inverse());
    let rgb = ColorPicker.percent_to_color(cpt.x/800);
    this.setState({color: "rgb(${rgb[0]},${rgb[1]},${rgb[2]})"} as ColorPickerState);

  }

  
  render(props: ColorPickerProps) {

    const picker = (
      <div class="color-picker">
      <svg ref = {(e) => {this.svg = e as SVGSVGElement;} } 
        viewBox="0 0 800 400" style={{cursor:"crosshair"}} onClick={this.handleClick}
        onMouseEnter={(e) => {this.panel.style.fill="url(#rb)"}}
        onMouseLeave={(e) => {this.panel.style.fill="none"}} >
        </svg>
        <g>
          <defs>
            <linearGradient id="rb">
              <stop offset="0%" stopColor="#ff0000" />
              <stop offset="20%" stopColor="#ffff00" />
              <stop offset="40%" stopColor="#00ff00" />
              <stop offset="60%" stopColor="#00ffff" />
              <stop offset="80%" stopColor="#0000ff" />
              <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>
          </defs>
          <rect fill={props.defaultColor} width="800" height="400"/>
          <rect ref={(e) => {this.panel = e as HTMLElement;}} fill="none" y="100" width="800" height="300" />
        </g>
        <rect fill="none" stroke="#000" strokeWidth="10" width="800" height="400"/>
      </div>
    )
    

    const p = (
      <div>
        <div class='cp-swatch' ref={(element) => this.pickerMount = element} 
          onMouseEnter = {(e) => {this.setState({displayColorPicker: true} as ColorPickerState)}}>
          <div class='cp-color' />
        </div>

        {this.state.displayColorPicker ? picker: null}
      </div>
    );
    //console.log("did render");
    return p;
  }

}

/*
//ported from https://github.com/tovic/color-picker
//all credits goes to original author
export class CP {
  private static instance = {};
  private first = 'firstChild';
  private scroll_left = 'scrollLeft';
  private scroll_top = 'scrollTop';
  private offset_left = 'offsetLeft';
  private offset_top = 'offsetTop';
  private delay = setTimeout;

  static is_set(x) {
    return x != null;
  }

  static is_string(x) {
    return typeof x === "string";
  }

  static is_object(x) {
    return typeof x === "object";
  }

  static object_length(x) {
    return Object.keys(x).length;
  }

  static edge(a, b, c) {
    if (a < b) return b;
    if (a > c) return c;
    return a;
  }

  static num(i, j) {
    return parseInt(i, j || 10);
  }

  static round(i) {
    return Math.round(i);
  }

  // [h, s, v] ... 0 <= h, s, v <= 1
  static HSV2RGB(a) {
    var h = +a[0],
      s = +a[1],
      v = +a[2],
      r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    i = i || 0;
    q = q || 0;
    t = t || 0;
    switch (i % 6) {
      case 0:
        r = v, g = t, b = p;
        break;
      case 1:
        r = q, g = v, b = p;
        break;
      case 2:
        r = p, g = v, b = t;
        break;
      case 3:
        r = p, g = q, b = v;
        break;
      case 4:
        r = t, g = p, b = v;
        break;
      case 5:
        r = v, g = p, b = q;
        break;
    }
    return [this.round(r * 255), this.round(g * 255), this.round(b * 255)];
  }

  static HSV2HEX(a) {
    return this.RGB2HEX(this.HSV2RGB(a));
  }

  // [r, g, b] ... 0 <= r, g, b <= 255
  static RGB2HSV(a) {
    var r = +a[0],
      g = +a[1],
      b = +a[2],
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h, s = (max === 0 ? 0 : d / max),
      v = max / 255;
    switch (max) {
      case min:
        h = 0;
        break;
      case r:
        h = (g - b) + d * (g < b ? 6 : 0);
        h /= 6 * d;
        break;
      case g:
        h = (b - r) + d * 2;
        h /= 6 * d;
        break;
      case b:
        h = (r - g) + d * 4;
        h /= 6 * d;
        break;
    }
    return [h, s, v];
  }

  static RGB2HEX(a) {
    let s = +a[2] | (+a[1] << 8) | (+a[0] << 16);
    let str = '000000' + s.toString(16);
    return str.slice(-6);
  }

  // rrggbb or rgb
  static HEX2HSV(s) {
    return this.RGB2HSV(this.HEX2RGB(s));
  }

  static HEX2RGB(s) {
    if (s.length === 3) {
      s = s.replace(/./g, '$&$&');
    }
    return [this.num(s[0] + s[1], 16), this.num(s[2] + s[3], 16), this.num(s[4] + s[5], 16)];
  }

  // convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
  static _2HSV_pri(a) {
    return [+a[0] / 360, +a[1] / 100, +a[2] / 100];
  }

  // convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
  static _2HSV_pub(a) {
    return [this.round(+a[0] * 360), this.round(+a[1] * 100), this.round(+a[2] * 100)];
  }

  // convert range from `0` to `255` in color into range from `0` to `1`
  static _2RGB_pri(a) {
    return [+a[0] / 255, +a[1] / 255, +a[2] / 255];
  }

  static _HEX2RGB(a) {
    return this._2RGB_pri(this.HEX2RGB(a));
  };


  // *
  static parse(x) {
    if (this.is_object(x)) return x;
    var rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x),
      hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x),
      hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hex) {
      return this.HEX2HSV(x.slice(1));
    } else if (hsv) {
      return this._2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
    } else if (rgb) {
      return this.RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
    }
    return [0, 1, 1]; // default is red
  }


  static version = '1.3.3';


  private b: Element;
  private h: HTMLElement;
  private $ = this;
  private _ = false;
  private hooks = {};
  private picker: HTMLElement;
  private on_down = "touchstart mousedown";
  private on_move = "touchmove mousemove";
  private on_up = "touchend mouseup";
  private on_resize = "orientationchange resize";


  private c;
  private HSV = this.get_data([0, 1, 1]); // default is red
  private H : HTMLElement;
  private SV : HTMLElement;
  private H_point;
  private SV_point;
  private start_H = 0;
  private start_SV = 0;
  private drag_H = 0;
  private drag_SV = 0;
  private left = 0;
  private top = 0;
  private P_W = 0;
  private P_H = 0;
  private v = CP.HSV2HEX(this.HSV);
  private set;
  private visiblility: boolean;

  private target;
  private events;

  constructor(target: Element, events: string = "touchstart mousedown") {
    this.b = target;
    this.h = document.documentElement;
    this.picker = document.createElement('div')

    CP.instance[target.id || target.nodeName || CP.object_length(CP.instance)] = this.$;
    this.set_data(CP.parse(target.getAttribute('data-color') || target.nodeValue || [0, 1, 1]))
    this.picker.className = 'color-picker';
    this.picker.innerHTML = '<div class="color-this.picker-control"><span class="color-this.picker-h"><i></i></span><span class="color-this.picker-sv"><i></i></span></div>';
    this.events = events;
    this.target = target;

    this.c = this.picker[this.first].children;
    

    this.H = this.c[0];
    this.SV = this.c[1];
    this.H_point = this.H[this.first];
    this.SV_point = this.SV[this.first];

    this.create(1);
    setTimeout(() => {
      let a = [CP.HSV2HEX(this.HSV), this.$];
      this.trigger("create", a);
      this.trigger_(0, a);
    }, 0);
  }



  // get mouse/finger coordinate
  private point(el, e) {
    var x = !!e.touches ? e.touches[0].pageX : e.pageX,
      y = !!e.touches ? e.touches[0].pageY : e.pageY,
      o = this.offset(el);
    return {
      x: x - o.l,
      y: y - o.t
    };
  }

  // get position
  private offset(el) {
    if (el === window) {
      var left = window.pageXOffset || this.h[this.scroll_left],
        top = window.pageYOffset || this.h[this.scroll_top];
    } else {
      var left = el[this.offset_left],
        top = el[this.offset_top];
      while (el = el.offsetParent) {
        left += el[this.offset_left];
        top += el[this.offset_top];
      }
    }
    return {
      l: left,
      t: top
    };
  }

  // get closest parent
  private closest(a, b) {
    while ((a = a.parentElement) && a !== b);
    return a;
  }

  // prevent default
  private prevent(e) {
    if (e) e.preventDefault();
  }

  // get dimension
  private size(el) {
    return el === window ? {
      w: window.innerWidth,
      h: window.innerHeight
    } : {
        w: el.offsetWidth,
        h: el.offsetHeight
      };
  }

  // get color data
  private get_data(a) {
    return this._ || (CP.is_set(a) ? a : false);
  }

  // set color data
  private set_data(a) {
    this._ = a;
  }

  // add hook
  add(ev, fn, id) {
    if (!CP.is_set(ev)) return this.hooks;
    if (!CP.is_set(fn)) return this.hooks[ev];
    if (!CP.is_set(this.hooks[ev])) this.hooks[ev] = {};
    if (!CP.is_set(id)) id = CP.object_length(this.hooks[ev]);
    return this.hooks[ev][id] = fn, this.$;
  }

  // remove hook
  remove(ev, id) {
    if (!CP.is_set(ev)) return this.hooks = {}, this.$;
    if (!CP.is_set(id)) return this.hooks[ev] = {}, this.$;
    return delete this.hooks[ev][id], this.$;
  }

  private fit(o?) {
    let w = this.size(window);
    let y = this.size(this.h);
    let z = y.h > w.h; // has vertical scroll bar
    let ww = this.offset(window);
    let yy = this.offset(this.h);
    let w_W = z ? /* Math.max(y.w, w.w) */ /* y.w : w.w + ww.l;
    let w_H = z ? w.h + ww.t : Math.max(y.h, w.h);
    let to = this.offset(this.target);
    let left = to.l;
    let top = to.t + this.size(this.target).h; // drop!
    if (CP.is_object(o)) {
      CP.is_set(o[0]) && (left = o[0]);
      CP.is_set(o[1]) && (top = o[1]);
    } else {
      if (left + this.P_W > w_W) {
        left = w_W - this.P_W;
      }
      if (top + this.P_H > w_H) {
        top = w_H - this.P_H;
      }
    }
    this.picker.style.left = left + 'px';
    this.picker.style.top = top + 'px';
    return this.trigger("fit", [this.$]), this.$;
  }


  private trigger_(k, x) {
    if (!k || k === "h") {
      this.trigger("change:h", x);
    }
    if (!k || k === "sv") {
      this.trigger("change:sv", x);
    }
    this.trigger("change", x);
  }


  private create(first?, bucket?) {
    //this.b = document.body;
    //this.h = document.documentElement;
    if (!first) {
      (bucket || this.b).appendChild(this.picker), this.$.visiblility = true;
    }
    this.P_W = this.size(this.picker).w;
    this.P_H = this.size(this.picker).h;
    let SV_size = this.size(this.SV);
    let SV_point_size = this.size(this.SV_point);
    let H_H = this.size(this.H).h;
    let SV_W = SV_size.w;
    let SV_H = SV_size.h;
    let H_point_H = this.size(this.H_point).h;
    let SV_point_W = SV_point_size.w;
    let SV_point_H = SV_point_size.h;
    let color = (e?) => {
      let a = CP.HSV2RGB(this.HSV);
      let b = CP.HSV2RGB([this.HSV[0], 1, 1]);
      this.SV.style.backgroundColor = 'rgb(' + b.join(',') + ')';
      this.set_data(this.HSV);
      this.prevent(e);
    };

    this.set = () => {
      this.HSV = this.get_data(this.HSV);
      color();
      this.H_point.style.top = (H_H - (H_point_H / 2) - (H_H * +this.HSV[0])) + 'px';
      this.SV_point.style.right = (SV_W - (SV_point_W / 2) - (SV_W * +this.HSV[1])) + 'px';
      this.SV_point.style.top = (SV_H - (SV_point_H / 2) - (SV_H * +this.HSV[2])) + 'px';
    };
    let exit = (e?) => {
      if (this.visible()) {
        this.visible().removeChild(this.picker);
        this.$.visiblility = false;
      }
      this.off(this.on_down, this.H, down_H);
      this.off(this.on_down, this.SV, down_SV);
      this.off(this.on_move, document, move);
      this.off(this.on_up, document, stop);
      this.off(this.on_resize, window, this.fit);
      return this.$;
    };

    this.set();
    let do_H = (e) => {
      var y = CP.edge(this.point(this.H, e).y, 0, H_H);
      this.HSV[0] = (H_H - y) / H_H;
      this.H_point.style.top = (y - (H_point_H / 2)) + 'px';
      color(e);
    }
    let do_SV = (e) => {
      let o = this.point(this.SV, e);
      let x = CP.edge(o.x, 0, SV_W);
      let y = CP.edge(o.y, 0, SV_H);
      this.HSV[1] = 1 - ((SV_W - x) / SV_W);
      this.HSV[2] = (SV_H - y) / SV_H;
      this.SV_point.style.right = (SV_W - x - (SV_point_W / 2)) + 'px';
      this.SV_point.style.top = (y - (SV_point_H / 2)) + 'px';
      color(e);
    }
    let move = (e) => {
      if (this.drag_H) {
        do_H(e);
        let v = CP.HSV2HEX(this.HSV);
        if (!this.start_H) {
          this.trigger("drag:h", [v, this.$]);
          this.trigger("drag", [v, this.$]);
          this.trigger_("h", [v, this.$]);
        }
      }
      if (this.drag_SV) {
        do_SV(e);
        let v = CP.HSV2HEX(this.HSV);
        if (!this.start_SV) {
          this.trigger("drag:sv", [v, this.$]);
          this.trigger("drag", [v, this.$]);
          this.trigger_("sv", [v, this.$]);
        }
      }
      this.start_H = 0,
        this.start_SV = 0;
    }
    let stop = (e) => {
      let t = e.target;
      let k = this.drag_H ? "h" : "sv";
      let a = [CP.HSV2HEX(this.HSV), this.$];
      let is_target = t === this.target || this.closest(t, this.target) === this.target;
      let is_picker = t === this.picker || this.closest(t, this.picker) === this.picker;
      if (!is_target && !is_picker) {
        // click outside the target or this.picker element to exit
        if (this.visible() && this.events !== false) exit(); this.trigger("exit", [this.$]), this.trigger_(0, a);
      } else {
        if (is_picker) {
          this.trigger("stop:" + k, a);
          this.trigger("stop", a);
          this.trigger_(k, a);
        }
      }
      this.drag_H = 0,
        this.drag_SV = 0;
    }
    let down_H = (e) => {
      let start_H = 1;
      let drag_H = 1;
      move(e);
      this.prevent(e);
      this.trigger("start:h", [this.v, this.$]);
      this.trigger("start", [this.v, this.$]);
      this.trigger_("h", [this.v, this.$]);
    }
    let down_SV = (e) => {
      let start_SV = 1;
      let drag_SV = 1;
      move(e);
      this.prevent(e);
      this.trigger("start:sv", [this.v, this.$]);
      this.trigger("start", [this.v, this.$]);
      this.trigger_("sv", [this.v, this.$]);
    }


    if (first) {
      this.picker.style.left = this.picker.style.top = '-9999px';
      let click = (e) => {
        var t = e.target,
          is_target = t === this.target || this.closest(t, this.target) === this.target;
        if (is_target) {
          this.create();
        } else {
          exit();
        }
        this.trigger(is_target ? "enter" : "exit", [this.$]);
      }
      if (this.events !== false) {
        this.on(this.events, this.target, click);
      }
      let create = () => {
        this.create(1);
        this.trigger("create", [this.$]);
        return this.$;
      };
      let destroy = () => {
        if (this.events !== false) {
          this.off(this.events, this.target, click);
        }
        exit(), this.set_data(false);
        this.trigger("destroy", [this.$]);
        return this.$;
      }
    } else {
      this.fit();
    }

    if (!first) {
      this.on(this.on_down, this.H, down_H);
      this.on(this.on_down, this.SV, down_SV);
      this.on(this.on_move, document, move);
      this.on(this.on_up, document, stop);
      this.on(this.on_resize, window, this.fit);
    }
  }


  // trigger hook
  trigger(ev, a, id?) {
    if (!CP.is_set(this.hooks[ev])) return this.$;
    if (!CP.is_set(id)) {
      for (var i in this.hooks[ev]) {
        this.hooks[ev][i].apply(this.$, a);
      }
    } else {
      if (CP.is_set(this.hooks[ev][id])) {
        this.hooks[ev][id].apply(this.$, a);
      }
    }
    return this.$;
  }
  visible() {
    return this.picker.parentNode;
  }

  // add event
  private on(ev, el, fn) {
    ev = ev.split(/\s+/);
    for (var i = 0, ien = ev.length; i < ien; ++i) {
      el.addEventListener(ev[i], fn, false);
    }
  }

  // remove event
  private off(ev, el, fn) {
    ev = ev.split(/\s+/);
    for (var i = 0, ien = ev.length; i < ien; ++i) {
      el.removeEventListener(ev[i], fn);
    }
  }



}
*/