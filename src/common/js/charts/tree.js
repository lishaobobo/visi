import * as d3 from "d3";
class Tree {
  constructor(opt) {
    this.el = opt.el;
    this.data = opt.data;
    this.tree = null;
    this.width = null;
    this.height = null;
    this.group = null;
    this.link = null;
    this.node = null;
  }
  init() {
    this.el = d3.select(this.el).append('svg');
    let x0 = Infinity;
    let x1 = -x0;
    this.el.attr("viewBox", [0, 0, this.width, x1 - x0 + this.tree.dx * 2]);
    this.group = this.el
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", "10")
      .attr("transform", `translate(${this.tree.dy / 3},${this.tree.dx - x0})`);
  }

  layout() {
    const root = d3.hierarchy(this.data);
    root.dx = 10;
    root.dy = width / (root.height + 1);
    this.tree = d3.tree().nodeSize([root.dx, root.dy])(root);
  }

  processLink() {
    this.link = this.group
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", "0.4")
      .attr("stroke-width", "1.5")
      .selectAll("path")
      .data(this.tree.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      );
  }

  processNode() {
    this.node = this.group
      .append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(this.tree.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);
  }

  render() {
    this.layout();
    this.init();
    this.processLink();
    this.processNode();
    this.node
      .append("circle")
      .attr("fill", (d) => (d.children ? "#555" : "#999"))
      .attr("r", 2.5);

    this.node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -6 : 6))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "white");
  }
}

export default Tree