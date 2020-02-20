import * as d3 from "d3";
import * as util from "../map/util";
import Base from "../Base";

function titleFormat(value) {
  return (value * 100).toFixed(2) + "%";
}

function callAttr(selection, obj) {
  Object.keys(obj).forEach(key => {
    selection.attr(key, obj[key]);
  });
}

function callStyle(selection, obj) {
  Object.keys(obj).forEach(key => {
    selection.style(key, obj[key]);
  });
}

const TEXT_CENTER_ATTR = {
  "text-anchor": "middle",
  "dominant-baseline": "middle"
};

const DESTORY_LIST = [
  "text",
  "clipBox",
  "clipPath",
  "centerBox",
  "centerContent",
  "centerText",
  "border",
  "group",
  "waveScaleXScale",
  "waveScaleX",
  "waveScaleY",
  "newClipArea"
];

class Wave extends Base {
  constructor(options) {
    super(
      // 参数1：用户端参数
      options,
      // 参数2：组件默认参数
      {
        // 内边距
        padding: 10,
        // 边框样式
        borderStyle: {
          stroke: "#000000",
          strokeWidth: 3
        },
        // 填充物样式
        centerStyle: {
          color: "#d06969",
          padding: 3
        },
        // 文字样式
        textStyle: {
          color: "#000000",
          clipColor: "#ffffff",
          fontSize: "40px"
        },
        titleFormat: titleFormat,
        animationConfig: {
          // 动画速度
          duration: 3000,
          // 动画缓动函数
          ease: d3.easeLinear
        },
        // 波浪顺滑度
        density: 50,
        // 波浪数量
        waveCount: 5,
        // 波浪高度
        waveHeight: 5,
        waveAnimationConfig: {
          // 波浪移动速度
          duration: 3000,
          ease: d3.easeLinear
        }
      },
      // 参数3：Base组件的配置参数
      {
        useDefs: true
      }
    );
  }

  _init() {
    const options = this._options;

    // 更新直径半径
    this.updateSize();
    const { radius, paddingTotal } = this;

    // 创建图形组
    this.group = this.svg.append("g");

    // 映射多重波浪为两个直径的宽度
    this.waveScaleXScale = d3.scaleLinear();
    this.waveScaleX = d3.scaleLinear();
    this.waveScaleY = d3.scaleLinear();
    this.newClipArea = d3.area();

    // 绘制边框
    this.createBorder();

    // 绘制波浪
    this.createWave();

    // 注册动画
    this.animationWave = this.registerAnimate(this.clipPath, () => {
      this.clipPath.attr("transform", `translate(${-radius},${paddingTotal})`);
      this.animationWave(this.waveTickFunc(), options.waveAnimationConfig);
    });

    // 注册动画
    this.animation = this.registerAnimate(d3, () => {});

    // 绘制
    this.render(options.value);

    // 执行动画
    this.animationWave(this.waveTickFunc(), options.waveAnimationConfig);
  }

  _onSetViewBoxSize(container) {
    let width = parseInt(container.style("width"));
    let height = parseInt(container.style("height"));
    width = height = Math.min(width, height);
    return { width, height };
  }

  _resize() {
    if (this.destroyed) {
      return;
    }
    this.updateSize();
    this.resetSvgSize();
    this.resetViewBoxSize();
    this.render(this._options.value);
    this.animationWave(this.waveTickFunc(), this._options.waveAnimationConfig);
  }

  _setOptions() {
    this.render(this._options.value);
  }

  createBorder() {
    // 创建外层边框
    this.border = this.group.append("circle").attr("fill", "none");
  }

  createWave() {
    // 创建基础文字
    this.text = this.createText(this.group);

    // 创建波浪裁剪对象
    this.clipBox = this.defs
      .append("clipPath")
      .attr("id", `clipWavefillgauge_${this.uuid}`);
    this.clipPath = this.clipBox.append("path");

    // 创建中心填充物
    this.centerBox = this.group
      .append("g")
      .attr("clip-path", `url(#clipWavefillgauge_${this.uuid})`);
    this.centerContent = this.centerBox.append("circle");

    // 创建被填充物覆盖的文字
    this.centerText = this.createText(this.centerBox);
  }

  createText(parent) {
    return parent.append("text").call(callAttr, TEXT_CENTER_ATTR);
  }

  render(value) {
    if (this.destroyed) {
      return;
    }
    const _me = this;
    const options = this._options;
    const { borderStyle } = options;
    const { paddingTotal, diameter, radius } = this;
    const percent = diameter - value * diameter;

    this.group.attr(
      "transform",
      `translate(${this.minSize / 2},${this.minSize / 2})`
    );

    // 更新外层边框
    this.border
      .attr(
        "r",
        this.minSize / 2 - options.padding - borderStyle.strokeWidth / 2
      )
      .attr("stroke", borderStyle.stroke)
      .attr("stroke-width", borderStyle.strokeWidth);

    // 波浪内容
    var data = [];
    for (var i = 0; i <= options.density * options.waveCount * 2; i++) {
      data.push({ x: i / options.density, y: i / options.density });
    }

    const { waveScaleXScale, waveScaleX, waveScaleY, newClipArea } = this;
    // 映射多重波浪为两个直径的宽度
    waveScaleXScale.domain([0, (data.length - 1) / options.density]);
    waveScaleX.range([-diameter, diameter]);
    waveScaleY.range([-options.waveHeight + percent, percent]);
    newClipArea
      .x(d => waveScaleX(waveScaleXScale(d.x)))
      .y0(d => waveScaleY(Math.sin(d.y * 2 * Math.PI)))
      .y1(() => _me.minSize - paddingTotal * 2);

    const { centerStyle, textStyle } = options;

    // 更新波浪
    this.clipPath
      .datum(data)
      .attr("d", newClipArea)
      .attr("transform", `translate(${-radius},${paddingTotal})`);

    // 更新填充物
    this.centerContent.attr("r", radius).attr("fill", centerStyle.color);

    this.renderText();
  }

  renderText() {
    const options = this._options;
    const textStyle = options.textStyle;
    const value = options.value;
    let title = options.title;
    if (!(title || title === 0 || title === "")) {
      title = options.titleFormat ? options.titleFormat(value) : value;
    }
    // 更新基础文字
    this.text.text(title).call(callStyle, {
      fill: textStyle.color,
      "font-size": textStyle.fontSize
    });
    // 更新填充物覆盖文I
    this.centerText.text(title).call(callStyle, {
      fill: textStyle.clipColor,
      "font-size": textStyle.fontSize
    });
  }

  update(newValue) {
    const options = this._options;
    const oldValue = options.value;
    if (Number(newValue) > 1) {
      newValue = 1;
    }
    if (Number(newValue) < 0) {
      newValue = 0;
    }
    const diff = newValue - oldValue;
    options.value = Number(newValue);

    // 动画前往新值
    this.animation(t => {
      this.render(oldValue + diff * t);
    }, options.animationConfig);
    this.animationWave(this.waveTickFunc(), options.waveAnimationConfig);
  }

  waveTickFunc() {
    return t =>
      `translate(${-this.radius + t * this.diameter}, ${-this.radius})`;
  }

  updateSize() {
    const options = this._options;
    this.minSize = this._onSetViewBoxSize(this.container).width;

    const { borderStyle, centerStyle } = options;
    this.paddingTotal =
      options.padding + borderStyle.strokeWidth + centerStyle.padding;
    this.diameter = this.minSize - this.paddingTotal * 2;
    this.radius = this.diameter / 2;
  }

  destroy() {
    DESTORY_LIST.forEach(key => (this[key] = null));
    super.destroy();
  }
}

export { Wave as default };
