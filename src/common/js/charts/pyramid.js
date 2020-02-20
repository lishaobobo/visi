import * as d3 from "d3";
import Base from "../Base";

const DESTORY_LIST = [
  "group",
  "items",
  "maxCount",
  "maxData",
  "color",
  "xScale",
  "yOffsetScale",
  "dataScale",
  "halfWidth",
  "layerHeight"
];

const TRANSITION_CONFIG = d3
  .transition()
  .duration(500)
  .ease(d3.easeLinear);

class Pyramid extends Base {
  constructor(options) {
    super(
      // 参数1：用户端参数
      options,
      // 参数2：组件默认参数
      {
        // 内边距
        padding: 10,
        // 间距
        space: 0,
        // 整体透明度
        opacity: 0.9,
        // 亮度差值
        lightDiff: 0.1,
        borderStyle: {
          width: 0.5,
          color: "#000000"
        }
      }
    );
  }

  _init() {
    const options = this._options;

    // 创建图形组
    this.group = this.svg.append("g");

    // 创建数据结构
    this.initBase();

    // 更新宽高参数
    this.updateSize();

    // 绘制主要结构
    this.createPyramid();

    // 绘制
    this.render(options.value);
  }

  _resize() {
    if (this.destroyed) {
      return;
    }
    this.resetSvgSize();
    this.resetViewBoxSize();
    this.updateSize();
    this.render();
  }

  _setOptions() {
    this.initBase();
    this.updateSize();
    this.render();
  }

  initBase() {
    const options = this._options;

    this.maxCount = options.data.length;
    this.maxData = d3.max(options.data);
    this.color = d3.scaleOrdinal().range(d3.schemeOranges[9]);
    this.xScale = d3.scaleLinear().domain([0, this.maxData]);
    this.yOffsetScale = d3.scaleLinear().range([0, -50]);
    this.dataScale = d3.scaleLinear().range([0, this.maxData]);
  }

  createPyramid() {
    const options = this._options;

    this.items = this.group
      .selectAll("g")
      .data(options.data)
      .join("g")
      .attr("class", "item")
      .each(function(d) {
        // 创建顶部多边形
        d3.select(this)
          .append("polygon")
          .datum(d)
          .attr("class", "top-side");

        // 创建右侧多边形
        d3.select(this)
          .append("polygon")
          .datum(d)
          .attr("class", "right-side");

        // 创建左侧多边形
        d3.select(this)
          .append("polygon")
          .datum(d)
          .attr("class", "left-side");
      });
  }

  render() {
    if (this.destroyed) {
      return;
    }
    const options = this._options;
    const count = options.data.length - 1;

    this.svg
      .selectAll("polygon")
      .transition(TRANSITION_CONFIG)
      .attr("stroke", options.borderStyle.color)
      .attr("stroke-width", options.borderStyle.width);

    this.group
      .selectAll(".right-side")
      .attr("fill", (_, index) => this.getColor(index))
      .attr("transform", (_, index) =>
        this.getTransform(index, count, options.space)
      )
      .attr("points", (_, index) =>
        this.getSidePoints(count - index, options.data)
      );

    this.group
      .selectAll(".left-side")
      .attr("fill", (_, index) => this.getColor(index, -options.lightDiff))
      .attr("transform", (_, index) =>
        this.getTransform(index, count, options.space)
      )
      .attr("points", (_, index) =>
        this.getSidePoints(count - index, options.data, true)
      );

    this.group
      .selectAll(".top-side")
      .attr("fill", (_, index) => this.getColor(index, options.lightDiff))
      .attr("transform", (_, index) =>
        this.getTransform(index, count, options.space)
      )
      .attr("points", (_, index) =>
        this.getTopPoints(count - index, options.data)
      );
  }

  // 工具函数，返回每个面的颜色
  getColor(index, light = 0) {
    const hsl = d3.hsl(this.color(index));
    hsl.opacity = this._options.opacity;
    hsl.l = hsl.l + light;
    return hsl;
  }

  // 工具函数，返回保持间距的偏移值
  getTransform(index, count, space) {
    return `translate(0,${(count - 1 - index) * space})`;
  }

  getSidePoints(index, data, reverse) {
    const layerHeight = this.layerHeight;
    const xScale = this.xScale;
    const yOffsetScale = this.yOffsetScale;

    const currentY = index * layerHeight;
    const nextY = (index + 1) * layerHeight;
    const currentData = index ? data[index - 1] : 0;
    const nextData = data[index];

    // 此处预留，为未来x轴偏移预留结构
    const leftTop = 0;
    const rightTop = leftTop + currentData;
    const leftBottom = 0;
    const rightBottom = leftBottom + nextData;
    if (!index) {
      return [
        // `${xScale(dataScale(0.5))} 0`, // 居中
        `${xScale(0)} 0`, // 左边
        `${xScale(leftBottom)} ${nextY + yOffsetScale(xScale(leftBottom))}`,
        `${reverse ? -xScale(rightBottom) : xScale(rightBottom)} ${nextY +
          yOffsetScale(xScale(rightBottom))}`
      ];
    }
    return [
      // 上层 先左后右
      `${xScale(leftTop)} ${currentY + yOffsetScale(xScale(leftTop))}`,
      `${reverse ? -xScale(rightTop) : xScale(rightTop)} ${currentY +
        yOffsetScale(xScale(rightTop))}`,
      // 下层 先右后左
      `${reverse ? -xScale(rightBottom) : xScale(rightBottom)} ${nextY +
        yOffsetScale(xScale(rightBottom))}`,
      `${xScale(leftBottom)} ${nextY + yOffsetScale(xScale(leftBottom))}`
    ];
  }

  getTopPoints(index, data) {
    if (!index) {
      return;
    }
    const layerHeight = this.layerHeight;
    const xScale = this.xScale;
    const yOffsetScale = this.yOffsetScale;

    const currentY = index * layerHeight;
    const currentData = index ? data[index - 1] : 0;

    const leftTop = 0;
    const rightTop = leftTop + currentData;
    return [
      // 中下
      `${xScale(leftTop)} ${currentY + yOffsetScale(xScale(leftTop))}`,
      // 右
      `${xScale(rightTop)} ${currentY + yOffsetScale(xScale(rightTop))}`,
      // 中上
      `${xScale(leftTop)} ${currentY + yOffsetScale(xScale(rightTop * 2))}`,
      // 左
      `${-xScale(rightTop)} ${currentY + yOffsetScale(xScale(rightTop))}`
    ];
  }

  updateSize() {
    const options = this._options;
    this.halfWidth = this.width / 2 - options.padding;
    this.layerHeight =
      (this.height -
        options.padding * 2 -
        options.space * (this.maxCount - 1)) /
      this.maxCount;

    this.group.attr(
      "transform",
      `translate(${this.width / 2},${options.padding})`
    );

    this.color.domain(d3.range(this.maxCount));
    this.xScale.range([0, this.halfWidth]);
    this.yOffsetScale.domain([0, this.halfWidth]);
  }

  destroy() {
    DESTORY_LIST.forEach(key => (this[key] = null));
    super.destroy();
  }
}

export { Pyramid as default };
