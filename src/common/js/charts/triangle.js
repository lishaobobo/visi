/**
 *
 * @author: hxg
 *
 */
import * as d3 from "d3";
import * as util from "../map/util";

class Triangle {
  constructor(options) {
    let o = {
      el: null,
      data: [],
      colorList: d3.schemeCategory10,
      margin: {
        top: 20,
        left: 40,
        right: 20,
        bottom: 20
      },
      textInness: 10,
      hasXAxis: {
        show: true,
        ticks: 6
      },
      hasYAxis: {
        show: true,
        ticks: 6
      },
      hasAnimatetion: true,
      hasSort: undefined
    };
    if (!options.el) o.el = d3.select("body").append("svg");
    util.extend(true, o, options);
    util.extend(true, this, o);
    this.width = parseInt(d3.select(this.el).style("width"));
    this.height = parseInt(d3.select(this.el).style("height"));
    this._init();
  }

  _init() {
    this.svg = d3.select(this.el).append("svg");
    this.svg.attr("width", this.width).attr("height", this.height);
    this.svg.html("");
    this.itemViewHeight = this.height - this.margin.bottom - this.margin.top;
    this.itemViewWidth = this.width - this.margin.left - this.margin.right;
    this.group = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
    this._sort();
    this._createXaxis();
    this._createYaxis();
    this._createTriangle();
  }

  _sort() {
    if (!this.hasSort) return;
    if (this.hasSort === "descending") {
      this.data.sort((a, b) => b.value - a.value);
    } else {
      this.data.sort((a, b) => a.value - b.value);
    }
  }

  _createXaxis() {
    this.xScale = d3
      .scaleBand()
      .rangeRound([0, this.itemViewWidth])
      .paddingOuter(0.3)
      .paddingInner(0.3)
      .domain(this.data.map(d => d.name));

    if (!this.hasXAxis.show) return;

    this.xAxis = this.group
      .append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(0,${this.itemViewHeight})`)
      .call(d3.axisBottom(this.xScale));
  }

  _createYaxis() {
    this.yScale = d3
      .scaleLinear()
      .rangeRound([this.height - 40, 0])
      .domain([0, d3.max(this.data.map(d => d.value + 30))]);
    if (!this.hasYAxis.show) return;

    this.yAxis = this.group
      .append("g")
      .attr("class", "yAxis")
      .call(d3.axisLeft(this.yScale).ticks(this.hasYAxis.ticks));
  }

  animate() {
    this.group
      .selectAll(".triangle")
      .transition()
      .duration(1000)
      .delay((d, i) => (i * 500) / 3)
      .attr("d", d => this._computePath(0, d, 0))
      .attr(
        "transform",
        d => `translate(${this.xScale(d.name)},${this.yScale(d.value)})`
      );
  }

  /**
   *
   * 当前使用path来实现三角形,可以换成多边形polygon来实现
   *
   */
  _createTriangle() {
    this.group
      .selectAll(".triangle")
      .data(this.data)
      .enter()
      .append("path")
      .attr("class", "triangle")
      .attr("d", d => this._computePath(1, d))
      .attr(
        "transform",
        d => `translate(${this.xScale(d.name)},${this.itemViewHeight})`
      )
      .attr("fill", (d, i) => this.colorList[i]);

    if (this.hasAnimatetion) {
      this.animate();
      return;
    }
    this.group
      .selectAll(".triangle")
      .attr("d", d => this._computePath(0, d, 0))
      .attr(
        "transform",
        d => `translate(${this.xScale(d.name)},${this.yScale(d.value)})`
      );
  }

  /**
   *
   * @param {Number} y 柱状图的高度
   * @param {Object} d 当前柱子的数据
   * @param {Number} offsetX 初始偏移量,为了好的过渡效果
   */
  _computePath(y, d, offsetX = 20) {
    let arr = [];
    let a = {};
    a.centerX = this.xScale.bandwidth() / 2;
    a.centerY = y ? y : this.itemViewHeight - this.yScale(d.value);
    a.end = this.xScale.bandwidth();
    arr.push(
      `M${a.centerX + offsetX} 0 L${a.centerX * 2} ${a.centerY} L0 ${
        a.centerY
      }Z`
    );
    return arr.join("");
  }
}

export { Triangle as default };
