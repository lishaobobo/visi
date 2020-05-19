import * as d3 from "d3";
import * as util from "../map/util";

function getSplitInfo(total, index, allAngle = 360, offset = 0) {
  const leftOffset = allAngle / 10;
  const steep = allAngle / 5;
  let angle = 90 - leftOffset - steep * index;
  angle -= offset;
  angle += 360;
  angle %= 360;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  if (angle <= 90) {
    x2 = 1;
    y2 = 1;
  } else if (angle <= 180) {
    const _angle = angle - 90;
    x2 = 1;
    y1 = 1;
  } else if (angle <= 270) {
    const _angle = angle - 180;
    x1 = 1;
    y1 = 1;
  } else if (angle < 360) {
    const _angle = angle - 270;
    x1 = 1;
    y2 = 1;
  }
  return {
    angle,
    x1,
    x2,
    y1,
    y2
  };
}

function textFormat(value) {
  return (value * 100).toFixed(2) + "%";
}
/**
 *
 * @class
 * @example
 * 默认配置
 *  options = {
 *    name: "Dashboard", //实例名
 *    el: document.body, //容器
 *    options: {
 *      value: 0, // 进度 0 - 1
 *      reverse: false, // 是否逆时针
 *      borderWidth: 10, // 进度条厚度
 *      radius: 50, // 圆半径,默认为50,实际使用时多为容器宽高最小值的一半
 *      cx: 100, //圆心x点坐标
 *      cy: 100, // 圆心y点坐标
 *      circle: true, // 圆形进度条
 *      splitConut: 2, // 渐变分段数量
 *      startColor: "",//开始颜色
 *      endColor: "", //结束颜色
 *      ease: d3.easeCubic, // 缓动函数
 *      duration: 1000, // 动画时间
 *      showCircle: true, // 是否显示圆角
 *      fullIsHideCircle: true, // 转满100%的时候不显示圆角
 *      showTrack: true, // 是否显示背景轨道
 *      trackColor: "#ffffff", // 背景轨道底色  rgba || 16进制
 *      showText: true, // 是否显示title
 *      text: null, // title内容
 *      textFormat: textFormat, // text内容格式化回调
 *      textStyle: {
 *        color: "#ffffff", // text颜色 rgba || 16进制
 *        fontSize: "16px", // text字体大小
 *      },
 *      changeEndCallback: null, // 动画结束回调
 *      padding: 14, // 内边距
 *      showDot: true, // Dot圆环是否显示
 *      dotRadius: 10, // 圆环半径
 *      dotThickness: 3, // 圆环边厚度
 *      dotFill: "#FFF", // 圆环填充颜色,默认为白色,为了盖住path,所以一般不更改
 *      dotStrokeColor: "#000", // 圆环边颜色
 *      showInnerCircle: true, // 是否含有内圆
 *      innerCircleFill: "rgba(0,0,0,1)", // 圆环填充颜色 rgba || 16进制 || hal || hsv || lab
 *      innerCircleScale: 0.9, // 内圆与外圆比, 默认为0.9, 值越大内圆越大
 *    }
 *   };
 *
 */
class Dashboard {
  _options = {
    name: "dashboard",
    el: document.body,
    options: {
      // 进度 0 - 1
      value: 0,
      // 是否逆时针
      reverse: false,
      // 进度条宽度
      borderWidth: 10,
      // 圆形进度条
      circle: true,

      //开始颜色
      startColor: "#000",
      //结束颜色
      endColor: "#fff",

      // 圆半径
      radius: 50,
      // 圆心位置
      cx: 100, //圆心x点坐标
      cy: 100, // 圆心y点坐标

      // 渐变分段数量
      splitConut: 2,
      // 缓动函数
      ease: d3.easeCubic,
      // 动画时间
      duration: 1000,
      // 是否显示圆角
      showCircle: true,
      // 转满100%的时候不显示圆角
      fullIsHideCircle: true,
      // 是否显示背景轨道
      showTrack: true,
      // 背景轨道底色
      trackColor: "#ffffff",
      // 是否显示title
      showText: true,
      text: null,
      textFormat: textFormat,
      textStyle: {
        color: "#ffffff",
        fontSize: "16px"
      },
      // 动画结束
      changeEndCallback: null,
      // 内边距
      padding: 14,
      // Dot相关配置
      showDot: true,
      dotRadius: 10,
      dotThickness: 3,
      dotFill: "#FFF",
      dotStrokeColor: "#000",
      // 是否含有内圆
      showInnerCircle: true,
      innerCircleFill: "rgba(0,0,0,1)",
      innerCircleScale: 0.9,
      allAngle: 360,
      offsetAngle: 0
    }
  };

  color = null;
  el = null;
  container = null;
  defs = null;
  linearList = [];
  pathList = [];
  options = {};
  svg = null;
  g = null;
  arc = null;
  circle_1 = null;
  circle_2 = null;
  background = null;
  textDom = null;
  dot = null;

  constructor(options) {
    // 合并参数
    util.extend(true, this._options, options);
    util.extend(true, this, this._options);

    // 加载容器
    if (this.el instanceof d3.selection) {
      this.container = this.el;
    } else {
      if (d3.select(this.el) instanceof d3.selection) {
        this.container = d3.select(this.el);
      } else {
        throw new Error("container unavailable !");
      }
    }

    // 加载svg
    this.svg = this.container.append("svg");

    // 加载uuid
    this.uuid = util.uuid();

    // 检测颜色
    this.color = d3.scaleSequential(
      d3.interpolate(this.options.startColor, this.options.endColor)
    );

    // 初始化内容
    this.init();
  }

  init() {
    const options = this.options;

    // 初始化容器内部
    this.svg.selectAll("*").remove();
    this.linearList.splice(0);
    this.pathList.splice(0);

    // 加载defs
    this.defs = this.svg.append("defs");

    // 初始化并加载g容器
    this.g = this.svg.append("g").attr("class", "g");

    // 设置容器与内容大小，与父级容器兼容
    this.updateSize();

    // 创建内圆
    if (options.showInnerCircle) {
      this.createInnerCircle();
    }
    // 优先加载轨道背景
    if (options.showTrack) {
      this.createBackground();
    }
    // 初始化并加载圆角
    if (options.showCircle) {
      this.createCircle();
    }
    // 初始化并加载文字
    if (options.showText) {
      this.createText();
    }

    const count = options.splitConut;

    // 初始化并加载linear
    this.initLinear(count);
    // 初始化并加载path
    this.initPath(count);

    // 初始化dot
    if (options.showDot) {
      this.createDot();
    }
    // 动画前往对应值
    this.animation(t => {
      this.render(t * options.value);
    });
  }

  initLinear(count) {
    this.linearList.length = count;
    const splitList = Array.from(this.linearList).map((_, index) =>
      getSplitInfo(
        count,
        index,
        this.options.allAngle,
        this.options.offsetAngle
      )
    );
    this.linearList = splitList.map((linearGradientInfo, index) => {
      const nextIndex = index === splitList.length - 1 ? 0 : index + 1;
      const linearGradient = this.defs
        .append("linearGradient")
        .attr("x1", linearGradientInfo.x1)
        .attr("y1", linearGradientInfo.y1)
        .attr("x2", linearGradientInfo.x2)
        .attr("y2", linearGradientInfo.y2)
        .attr("class", this.uuid)
        .attr("id", this.uuid + "_" + (index + 1));

      linearGradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", this.color((1 / count) * index));

      linearGradient
        .append("stop")
        .attr("offset", "100%")
        .attr("class", "linear_" + (index + 1) + "_stop")
        .attr("stop-color", this.color((1 / count) * (index + 1)));
      return linearGradient;
    });
  }

  initPath(count) {
    this.pathList.length = count;
    this.pathList = Array.from(this.pathList).map((_, index) => {
      const path = this.g
        .append("path")
        .attr("class", "split_path_1")
        .attr("fill", "url(#" + this.uuid + "_" + (index + 1) + ")")
        .attr("stroke-width", "2")
        .attr("stroke", "url(#" + this.uuid + "_" + (index + 1) + ")");
      return path;
    });
  }

  // 创建轨道两头圆角
  createCircle() {
    this.circle_1 = this.g.append("circle").attr("class", "circle_1");
    this.circle_2 = this.g.append("circle").attr("class", "circle_2");
  }

  // 创建轨道背景
  createBackground() {
    const options = this.options;
    const baseAngle = (Math.PI / 180) * options.allAngle;
    const offset = (Math.PI / 180) * options.offsetAngle;
    const borderCenter = options.radius + options.borderWidth / 2;
    this.background = this.g
      .append("path")
      .attr("class", "track-background")
      .attr("fill", "none")
      .attr(
        "d",
        this.arc({
          startAngle: offset,
          endAngle: offset + baseAngle
        })
      );
    this.background_circle_1 = this.g
      .append("circle")
      .attr("class", "background_circle_1")
      .attr(
        "cx",
        Math.sin((options.offsetAngle * Math.PI) / 180) * borderCenter
      )
      .attr(
        "cy",
        -Math.cos((options.offsetAngle * Math.PI) / 180) * borderCenter
      );
    this.background_circle_2 = this.g
      .append("circle")
      .attr("class", "background_circle_2")
      .attr(
        "cx",
        Math.sin(((options.offsetAngle + options.allAngle) * Math.PI) / 180) *
          borderCenter
      )
      .attr(
        "cy",
        -Math.cos(((options.offsetAngle + options.allAngle) * Math.PI) / 180) *
          borderCenter
      );
  }

  // 创建文字
  createText() {
    this.textDom = this.g
      .append("text")
      .attr("class", "dashboard-title")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");
  }

  // 创建轨道上的圆
  createDot() {
    this.options.dotRadius = this.options.borderWidth;
    this.dot = this.g
      .append("circle")
      .attr("r", this.options.dotRadius)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("class", "dot");
  }

  createInnerCircle() {
    this.innerCircle = this.g
      .append("circle")
      .attr("r", this.options.radius * this.options.innerCircleScale)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", this.options.innerCircleFill);
  }

  render(value) {
    const options = this.options;
    const count = options.splitConut;
    const baseAngle = (Math.PI / 180) * (options.allAngle / count);
    const offset = (Math.PI / 180) * options.offsetAngle;
    // 防止 1 % 0.1 === 0.999999999999999;
    const currentSplitValue = value === 1 ? 0 : value % (1 / count);
    const currentSplit = Math.floor(value / (1 / count));

    this.pathList.forEach((path, index) => {
      if (currentSplit < index) {
        path.attr("d", "");
      } else if (currentSplit === index) {
        path.attr(
          "d",
          this.arc({
            startAngle: baseAngle * index + offset,
            endAngle: baseAngle * (index + currentSplitValue * count) + offset
          })
        );
        const linear = this.linearList[index];
        linear
          .select(".linear_" + (index + 1) + "_stop")
          .attr(
            "stop-color",
            this.color((1 / count) * (index + currentSplitValue * count))
          );
      } else {
        path.attr(
          "d",
          this.arc({
            startAngle: baseAngle * index + offset,
            endAngle: baseAngle * (index + 1) + offset
          })
        );
      }
    });
    if (options.showTrack) {
      // 控制轨道
      this.background.attr("fill", options.trackColor);
      this.background_circle_1
        .attr("fill", options.trackColor)
        .attr("r", options.borderWidth / 2 - 1);
      this.background_circle_2
        .attr("fill", options.trackColor)
        .attr("r", options.borderWidth / 2 - 1);
    }

    const endAngle =
      (options.allAngle / count) * (currentSplit + currentSplitValue * count);
    const borderCenter = options.radius + options.borderWidth / 2;

    // 控制圆角
    if (options.showCircle) {
      this.circle_1
        .attr("fill", this.color(0))
        .attr("r", options.borderWidth / 2)
        .attr(
          "cx",
          Math.sin((options.offsetAngle * Math.PI) / 180) * borderCenter
        )
        .attr(
          "cy",
          -Math.cos((options.offsetAngle * Math.PI) / 180) * borderCenter
        );
      this.circle_2
        .attr("r", options.borderWidth / 2)
        .attr("fill", this.color(value))
        .attr(
          "cx",
          Math.sin(((endAngle + options.offsetAngle) * Math.PI) / 180) *
            borderCenter
        )
        .attr(
          "cy",
          -Math.cos(((endAngle + options.offsetAngle) * Math.PI) / 180) *
            borderCenter
        );

      if (options.fullIsHideCircle && value === 1) {
        this.circle_1.attr("r", 0);
        this.circle_2.attr("r", 0);
      } else {
        this.circle_1.attr("r", options.borderWidth / 2);
        this.circle_2.attr("r", options.borderWidth / 2);
      }
    }

    if (options.showDot) {
      this.dot
        .attr("stroke-width", options.dotThickness)
        .attr("fill", options.dotFill)
        .attr("stroke", options.dotStrokeColor)
        .attr(
          "cx",
          Math.sin(((endAngle + options.offsetAngle) * Math.PI) / 180) *
            borderCenter
        )
        .attr(
          "cy",
          -Math.cos(((endAngle + options.offsetAngle) * Math.PI) / 180) *
            borderCenter
        );
    }

    // 控制中心文字
    if (options.showText && this.textDom) {
      this.textDom
        .attr("font-size", options.textStyle.fontSize)
        .attr("fill", options.textStyle.color);
      const text = options.text;
      if (text || text === 0 || text === "") {
        this.textDom.html(text);
      } else {
        this.textDom.html(
          options.textFormat ? options.textFormat(value) : value
        );
      }
    }
  }

  update(newValue) {
    const options = this.options;
    const oldValue = options.value;
    if (Number(newValue) > 1) {
      newValue = 1;
    }
    if (Number(newValue) < 0) {
      newValue = 0;
    }
    const diff = newValue - oldValue;
    this.options.value = Number(newValue);

    // 动画前往新值
    this.animation(t => {
      this.render(oldValue + diff * t);
    });
  }

  setOptions(newOptions = {}) {
    util.extend(true, this.options, newOptions);
    this.render(this.options.value);
  }

  animation(tickCallback) {
    const options = this.options;
    if (this.transition && this.transition.interpolate) {
      this.transition.interrupt();
    }

    this.transition = this.g
      .transition()
      .duration(options.duration)
      .ease(options.ease)
      .tween("_", () => {
        return tickCallback;
      })
      .on("end", () => {
        if (typeof options.changeEndCallback === "function") {
          options.changeEndCallback(options.value);
        }
      });
  }

  destroy() {
    this.g.remove();
    this.g = null;
    this.defs.remove();
    this.defs = null;
    this.arc.remove();
    this.arc = null;
    this.color = null;
    this.svg = null;
    this.options = {};
    this.linearList.splice(0);
    this.pathList.splice(0);

    // 初始化容器内部
    this.container.selectAll("*").remove();
  }

  resize = util.debounce(() => {
    this.updateSize();
    this.render(this.options.value);
  });

  updateSize() {
    const options = this.options;
    const offsetWidth = parseInt(this.container.style("width"));
    const offsetHeight = parseInt(this.container.style("height"));
    const minRadius = Math.min(offsetWidth, offsetHeight);
    this.svg.attr("width", "100%").attr("height", "100%");
    options.radius = minRadius / 2 - options.borderWidth - options.padding;
    options.cx = minRadius / 2;
    options.cy = minRadius / 2;

    // 加载arc
    this.arc = d3
      .arc()
      .innerRadius(this.options.radius + 1)
      .outerRadius(this.options.radius + this.options.borderWidth - 1)
      .padAngle(-Math.PI / 180);

    this.svg.attr("viewBox", `0 0 ${minRadius} ${minRadius}`);
    this.g.attr(
      "transform",
      "translate(" + minRadius / 2 + "," + minRadius / 2 + ")"
    );
  }
}

export { Dashboard as default };
