import * as d3 from "d3";
import * as util from "./map/util";

class Base {
  _options = {
    name: "",
    el: document.body,
  };

  _config = {
    /**
     * 组件是否需要使用defs
     * true: 则提供defs
     * false: 则不提供
     */
    useDefs: false
  };

  _transition = {};

  constructor(options, subOptions, config) {
    // 合并参数
    // 优先合并子组件参数
    util.extend(true, this._options, subOptions);
    // 再合并用户参数
    util.extend(true, this._options, options);
    // 合并配置项
    util.extend(true, this._config, config);

    const _options = this._options;
    const _config = this._config;

    // 加载容器
    if (_options.el instanceof d3.selection) {
      this.container = _options.el;
    } else {
      if (d3.select(_options.el) instanceof d3.selection) {
        this.container = d3.select(_options.el);
      } else {
        throw new Error("container unavailable !");
      }
    }

    // 清理container容器内部
    this.container.selectAll("*").remove();

    // 加载uuid
    this.uuid = util.uuid();

    // 加载svg
    this.svg = this.container.append("svg").style("display", "block");

    // 加载defs
    if (_config.useDefs) {
      this.defs = this.svg.append("defs");
    }

    // 设置宽高
    this.resetSvgSize();
    this.resetViewBoxSize();

    // 初始化内容
    this._init();
  }

  resetSvgSize() {
    const options = this._options;
    const width =
      typeof options.width === "undefined"
        ? parseInt(this.container.style("width"))
        : options.width;
    const height =
      typeof options.height === "undefined"
        ? parseInt(this.container.style("height"))
        : options.height;
    this.svg.attr("width", width);
    this.svg.attr("height", height);

    this.width = parseInt(this.svg.style("width"));
    this.height = parseInt(this.svg.style("height"));
  }

  resetViewBoxSize() {
    const { width, height } = this._onSetViewBoxSize(this.container);
    this.svg.attr("viewBox", `0 0 ${width} ${height}`);
  }

  // 不可写为箭头函数，否则作为父级类拥有绝对优先级，子级类无法通过定义来覆盖该函数
  _onSetViewBoxSize(container) {
    return {
      width: parseInt(this.svg.style("width")),
      height: parseInt(this.svg.style("height"))
    };
  }

  resize = util.debounce(() => {
    this._resize();
  });

  registerAnimate(obj, onEndCallback) {
    const uuid = util.uuid();
    return (tickCallback, options = {}) => {
      if (this._transition[uuid] && this._transition[uuid].interpolate) {
        this._transition[uuid].interrupt();
      }
      this._transition[uuid] = obj
        .transition()
        .duration(options.duration)
        .ease(options.ease)
        .attrTween("transform", () => tickCallback)
        .on("end", () => {
          if (this.destroyed) {
            return;
          }
          if (onEndCallback) {
            onEndCallback();
          }
        });
    };
  }

  setOptions(newOptions) {
    util.extend(true, this._options, newOptions);
    this._setOptions();
  }

  destroy() {
    this.destroyed = true;
    this.container.selectAll("*").remove();
    this.container = null;
    this.svg = null;
    // 加载defs
    if (this._config.useDefs) {
      this.defs = null;
    }
    Object.keys(this._transition).forEach(
      uuid =>
        this._transition[uuid].interpolate && this._transition[uuid].interrupt()
    );
    this._transition = {};
  }
}

export { Base as default };
