import * as d3 from "d3";
import * as util from "../map/util";

function getSplitInfo(total, index) {
  const innerAngleTotal = 180 * (total - 2);
  const oneAngleTotal = innerAngleTotal / total;
  const angle =
    oneAngleTotal - (oneAngleTotal / 2 + (180 - oneAngleTotal) * index);

  return {
    angle,
    x: Math.sin((angle * Math.PI) / 180),
    y: Math.cos((angle * Math.PI) / 180)
  };
}

function titleFormat(value) {
  return (value * 100).toFixed(2) + "%";
}

const TRANSITION_CONFIG = d3
  .transition()
  .duration(500)
  .ease(d3.easeLinear);

class Progress {
  _options = {
    name: "",
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

      // 圆半径
      // radius: 50,
      // 圆心位置
      // cx: 100,
      // cy: 100,

      // 渐变分段数量
      splitConut: 2,
      // 配色
      color: d3.scaleSequential(d3.interpolate("#fff123", "red")),
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
      showTitle: true,
      title: null,
      titleFormat: titleFormat,
      titleStyle: {
        color: "#ffffff",
        fontSize: "16px"
      },
      // 动画结束
      changeEndCallback: null,
      // 内边距
      padding: 14,
      // resize时触发的方式，有viewbox和animate两种
      resizeType: "animate"
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
  titleDom = null;

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
    if (typeof this.options.color === "string") {
      this.color = d3.scaleSequential(
        d3.interpolate(this.options.color, this.options.color)
      );
    } else {
      this.color = this.options.color;
    }

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

    // 优先加载轨道背景
    if (options.showTrack) {
      this.createBackground();
    }
    // 初始化并加载圆角
    if (options.showCircle) {
      this.createCircle();
    }
    // 初始化并加载文字
    if (options.showTitle) {
      this.createTitle();
    }

    const count = options.splitConut;

    // 初始化并加载linear
    this.initLinear(count);
    // 初始化并加载path
    this.initPath(count);

    // 动画前往对应值
    this.animation(t => {
      this.render(t * options.value, true);
    });
  }

  initLinear(count) {
    this.linearList.length = count;
    this.linearList = Array.from(this.linearList).map((_, index) => {
      const linearGradientInfo = getSplitInfo(count, index);
      const linearGradient = this.defs
        .append("linearGradient")
        .attr("x1", linearGradientInfo.x >= 0 ? 0 : -linearGradientInfo.x)
        .attr("x2", linearGradientInfo.x >= 0 ? linearGradientInfo.x : 0)
        .attr("y1", linearGradientInfo.y >= 0 ? 0 : -linearGradientInfo.y)
        .attr("y2", linearGradientInfo.y >= 0 ? linearGradientInfo.y : 0)
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

  createCircle() {
    this.circle_1 = this.g.append("circle").attr("class", "circle_1");
    this.circle_2 = this.g.append("circle").attr("class", "circle_2");
  }

  createBackground() {
    this.background = this.g
      .append("circle")
      .attr("class", "track-background")
      .attr("fill", "none");
  }

  createTitle() {
    this.titleDom = this.g
      .append("text")
      .attr("class", "progress-title")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");
  }

  render(value, isInit) {
    this.svg.selectAll("*").interrupt();
    const options = this.options;
    const count = options.splitConut;
    const baseAngle = (Math.PI / 180) * (360 / count);
    // 防止 1 % 0.1 === 0.999999999999999;
    const currentSplitValue = value === 1 ? 0 : value % (1 / count);
    const currentSplit = Math.floor(value / (1 / count));

    this.pathList.forEach((path, index) => {
      if (!isInit && options.resizeType === "animate") {
        path = path.transition(TRANSITION_CONFIG);
      }
      if (currentSplit < index) {
        path.attr("d", "");
      } else if (currentSplit === index) {
        path.attr(
          "d",
          this.arc({
            startAngle: baseAngle * index,
            endAngle: baseAngle * (index + currentSplitValue * count)
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
            startAngle: baseAngle * index,
            endAngle: baseAngle * (index + 1)
          })
        );
      }
    });

    let background = this.background;
    let circle_1 = this.circle_1;
    let circle_2 = this.circle_2;
    if (!isInit && options.resizeType === "animate") {
      background = background.transition(TRANSITION_CONFIG);
      circle_1 = circle_1.transition(TRANSITION_CONFIG);
      circle_2 = circle_2.transition(TRANSITION_CONFIG);
    }

    // 控制轨道
    background
      .attr("stroke", options.trackColor)
      .attr("stroke-width", options.borderWidth)
      .attr("r", options.radius + options.borderWidth / 2)
      .attr("cx", 0)
      .attr("cy", 0);

    const endAngle = (360 / count) * (currentSplit + currentSplitValue * count);
    const borderCenter = options.radius + options.borderWidth / 2;

    // 控制圆角
    if (options.showCircle) {
      circle_1
        .attr("fill", this.color(0))
        .attr("r", options.borderWidth / 2)
        .attr("cy", -options.radius - options.borderWidth / 2);
      circle_2
        .attr("fill", this.color(value))
        .attr("r", options.borderWidth / 2)
        .attr("cx", Math.sin((endAngle * Math.PI) / 180) * borderCenter)
        .attr("cy", -Math.cos((endAngle * Math.PI) / 180) * borderCenter);

      if (options.fullIsHideCircle && value === 1) {
        circle_1.attr("r", 0);
        circle_2.attr("r", 0);
      } else {
        circle_1.attr("r", options.borderWidth / 2);
        circle_2.attr("r", options.borderWidth / 2);
      }
    }

    // 控制中心文字
    if (options.showTitle && this.titleDom) {
      this.titleDom
        .attr("font-size", options.titleStyle.fontSize)
        .attr("fill", options.titleStyle.color);
      const title = options.title;
      if (title || title === 0 || title === "") {
        this.titleDom.text(title);
      } else {
        this.titleDom.text(
          options.titleFormat ? options.titleFormat(value) : value
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

    this.transition = d3
      .transition()
      .duration(options.duration)
      .ease(options.ease)
      .attrTween("value", () => {
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

  updateSize(isInit) {
    const options = this.options;
    const offsetWidth = parseInt(this.container.style("width"));
    const offsetHeight = parseInt(this.container.style("height"));
    const minRadius = Math.min(offsetWidth, offsetHeight);
    const maxRadius = Math.max(offsetWidth, offsetHeight);
    const xMax = offsetWidth > offsetHeight;
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

    if (options.resizeType === "viewbox") {
      this.svg.attr("viewBox", `0 0 ${minRadius} ${minRadius}`);
    }
    this.g.attr(
      "transform",
      options.resizeType === "viewbox"
        ? `translate(${minRadius / 2},${minRadius / 2})`
        : `translate(${xMax ? maxRadius / 2 : minRadius / 2},${
            !xMax ? maxRadius / 2 : minRadius / 2
          })`
    );
  }
}

export { Progress as default };
