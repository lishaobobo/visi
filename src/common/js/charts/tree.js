import * as d3 from "d3";
function eventCallback() {}
class Tree {
  constructor(opt) {
    this.el = opt.el;
    this.data = opt.data;
    this.svg = null;
    this.root = null;
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
    this.group = null;
    this.link = null;
    this.node = null;
    this.timer = null;
    this.x0 = Infinity;
    this.x1 = -this.x0;
    this.scaleIcon = opt.scaleIcon;
    this.legend = opt.legend;
    this.eventCallback = eventCallback;
    this.render();
  }

  tree(data) {
    this.root = d3.hierarchy(data);
    this.root.dx = 50;
    this.root.dy = this.width / (this.root.height + 1);
    return d3.tree().nodeSize([this.root.dx, this.root.dy])(this.root);
  }

  init() {
    this.zoom = d3.zoom().on("zoom", this.zoomed.bind(this));
    this.svg = d3
      .select(this.el)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .html(
        '<defs> <marker id="arrow" markerWidth="10" markerHeight="10" refx="0" refy="3" orient="auto" markerUnits="strokeWidth"> <path d="M0,0 L0,6 L9,3 z" fill="#aaa" /> </marker> </defs>'
      );
    this.root = this.tree(this.data);
    this.root.each((d) => {
      if (d.x > this.x1) this.x1 = d.x;
      if (d.x < this.x0) this.x0 = d.x;
    });
    this.svg.attr("viewBox", [
      0,
      0,
      this.width,
      this.x1 - this.x0 + this.root.dx * 2,
    ]);
    this.group = this.svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", "10")
      .attr("class", "group")
      .attr(
        "transform",
        `translate(${this.root.dy / 3},${this.root.dx - this.x0})`
      );
    this.svg.call(this.zoom);
  }

  addLegend() {
    console.log(this.legend)
    d3.select(this.el)
      .append("div")
      .attr("class", "legend")
      .selectAll("p")
      .data(this.legend)
      .enter()
      .append("p")
      .html((d) => {
        return `<img style='margin-right:10px' src=${d.path} /> <span>${d.name}</span>`
      });
  }

  addScaleBtn() {
    d3.select(this.el)
      .append("div")
      .attr("class", "scaleBtn")
      .style("top", `${this.height - 80}px`)
      .selectAll(".icon")
      .data(this.scaleIcon)
      .enter()
      .append("img")
      .attr("class", "icon")
      .attr("src", (d, i) => this.scaleIcon[i].path)
      .on("click", (d) => {
        console.log(d);
      });
  }

  addLinks() {
    this.group
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(this.root.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .source((d) => {
            return [d.source.y + 48, d.source.x];
          })
          .target((d) => {
            return [d.target.y - 15, d.target.x];
          })
      )
      .attr("marker-end", "url(#arrow)");
  }

  addNodes() {
    const node = this.group
      .append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(this.root.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    node
      .append("image")
      .attr("xlink:href", "https://i.loli.net/2020/05/12/LfIg4z7PXlJTjv8.jpg")
      .attr("x", 0)
      .attr("y", -20)
      .attr("width", 40)
      .attr("height", 40)
      .style("cursor", "pointer")
      .on("click", this.eventCallback)
      .on("mouseenter", (d) => this.mouseEnter(d))
      .on("mouseout", () => this.mouseOut);

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", 0)
      .attr("y", 24)
      .attr("text-anchor", "start")
      .text((d) => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "#fff");
  }

  render() {
    this.init();
    this.addScaleBtn();
    this.addTooltip();
    this.addLinks();
    this.addNodes();
    this.addLegend();
  }

  eventCallback() {}
  mouseOut() {
    this.tooltip.style("opacity", 0);
  }
  mouseEnter(d) {
    this.tooltip.style("opacity", 1);
    console.log(d.data);
  }

  // resize() {
  //   this.distoryed();
  //   if (this.timer) clearTimeout(this.timer);
  //   this.timer = setTimeout(() => {
  //     this.render();
  //   }, 300);
  // }

  zoomed() {
    let { transform } = d3.event;
    this.group.attr(
      "transform",
      `translate(${this.root.dy / 3 + transform.x},${this.root.dx -
        this.x0 +
        transform.y}) scale(${transform.k})`
    );
  }

  addTooltip() {
    d3.select(".tooltip").remove();
    if (!this.tooltip) {
      this.tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    }
  }

  resetZoom() {
    this.svg
      .transition()
      .duration(500)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  distoryed() {
    this.svg.remove();
    d3.select(".tooltip").remove();
  }
}

export default Tree;
