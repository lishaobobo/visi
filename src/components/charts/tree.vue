<template>
  <div ref="svg" class="tree">
    <p @click="resetZoom" style="font-size:40px;text-align: center">点击重置</p>
  </div>
</template>
<script>
import * as d3 from "d3";
import axios from 'axios'
import Tree from '../../common/js/charts/tree'
import all from '../../common/data/all.csv'
import * as jsnx from 'jsnetworkx'
import _ from 'loadsh'
export default {
  name: 'tree',
  data() {
    return {
      csvData: {
        'Data.process_id': 'root',
        children: []
      },
      width: 0,
      tooltip: null,
      x0: Infinity,
      x1: -Infinity,
      root: {}
    }
  },
  mounted() {
    d3.csv('/assets/csv/all.csv').then((res) => {
      delete res.columns;
      // 去重之后处理
      let data = this.processData(_.uniqBy(res, 'Data.process_id'));
      this.root = this.tree(data);
      this.draw(this.root)
    })
  },
  methods: {
    resetZoom() {
      this.svg.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity)
    },
    processData(data) {
      data.length = data.length > 30 ? 30 : data.length
      let root = {
        'Data.process_id': 'root',
        children: []
      }
      let process_map = {};
      let root_map = {};
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        // 拿进程id等关联
        process_map[d[`Data.process_id`]] = d;
        // 找到root
        if (d[`Data.parent_process_id`] === d[`Data.root_process_id`]) {
          let root_process_id = d[`Data.root_process_id`];
          let _root = {
            "Data.process_id": root_process_id,
            "Data.process_name": d["Data.root_process_name"],
            "Data.process_path": d["Data.root_process_path"],
          };
          if (!root_map[root_process_id]) {
            root_map[root_process_id] = _root;
          }

          if (!process_map[root_process_id]) {
            process_map[root_process_id] = _root;
          }
        }
      }

      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const parent = process_map[d["Data.parent_process_id"]];
        if (!parent) continue;
        if (!parent.children) parent.children = [];
        parent && parent.children.push(d);
      }
      Object.keys(process_map).forEach(item => {
        root.children.push(process_map[item])
      })
      return root;
    },
    draw(source) {
      this.root.each(d => {
        if (d.x > this.x1) this.x1 = d.x;
        if (d.x < this.x0) this.x0 = d.x;
      });
      this.addToolTip()
      this.addSvg()
      this.renderNode(source)
      this.renderLink(source)
    },
    renderNode(source) {
      let _me = this;
      const nodes = this.root.descendants();
      const node = this.g.selectAll(".node")
        .data(nodes, (d, i) => d.id || (d.id = ++i));

      const nodesDOM = node
        .enter()
        .append('g')
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .attr("class", "node")
        .attr("transform", `translate(${this.root.dy / 3},${this.root.dx - this.x0})`)
        .on("click", function (d, i) {
          let string = d3.select(this).attr("transform");
          let translate = string.substring(string.indexOf("(") + 1, string.indexOf(")")).split(",");
          return _me.eventClick(d, translate);
        })

      nodesDOM.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 10)
        .on("mouseover", d => this.eventMouseOver(d))
        .on("mouseout", d => this.eventMouseOut(d))
      nodesDOM.transition()
        .duration(500)
        .attr("transform", d => `translate(${d.y + this.root.dy / 3},${d.x + this.root.dx - this.x0})`)
      nodesDOM.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data['Data.process_name'] ? d.data['Data.process_name'].split('\n')[0] : d.data['Data.process_id'] === 'root' ? 'root' : '')
        .clone(true)
        .lower()
        .attr("stroke", "white");

      node.exit()
        .transition()
        .duration(500)
        .attr("transform", `translate(${source.tx},${source.ty})`)
        .remove();
    },
    renderLink(source) {
      console.log(source)
      const links = this.root.links();
      const link = this.g.selectAll("path.link")
        .data(links, d => d.target.id);

      const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

      const linkDOM = link.enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        // .attr('stroke-dasharray', d => d.target.children ? 0 : 5)
        .attr("transform", `translate(${this.root.dy / 3},${this.root.dx - this.x0})`)
        .attr("d", d3.linkHorizontal()
          .x(0)
          .y(0));

      linkDOM.transition()
        .duration(500)
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x));

      link.exit()
        .transition()
        .duration(500)
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();
    },
    addToolTip() {
      d3.select('.tooltip').remove()
      if (!this.tooltip) {
        this.tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
      }
    },
    addSvg() {
      if (this.svg) return
      this.svg = d3.select(this.$refs.svg).append('svg')
        .attr('width', document.documentElement.clientWidth)
        .attr('height', document.documentElement.clientHeight)
        .attr('viewBox', `0,0,${document.documentElement.clientWidth},${document.documentElement.clientHeight + 200}`)
      this.g = this.svg.append('g')
        .attr('class', 'container')
        .attr("font-family", "sans-serif")
        .attr("font-size", 16);
      this.zoom = d3.zoom().on("zoom", this.zoomed)
      this.svg.call(this.zoom);
    },
    zoomed() {
      this.g.attr("transform", d3.event.transform)
    },
    tree(data) {
      if (!data) throw new Error('data is not defined');
      const root = d3.hierarchy(data);
      root.dx = document.documentElement.clientHeight / root.children.length;
      root.dy = document.documentElement.clientWidth / (root.height + 1);
      return d3.tree()
        .nodeSize([root.dx, root.dy])(root);
    },
    eventMouseOver(d) {
      this.tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
      let str = ``;
      Object.keys(d.data).forEach(item => {
        if (item !== 'children') str += `${item}:${d.data[item]}<br/>`
      })
      this.tooltip.html(str)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY + 5) + "px");
    },
    eventMouseOut(d) {
      this.tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .style("left", 0)
        .style("top", 0);
    },
    autoBox() {
      let { left, right, top, bottom } = {
        left: 40,
        right: 40,
        top: 40,
        bottom: 40
      }
      const { x, y, width, height } = this.getBBox();
      return `${0},${50},${1920},${document.documentElement.clientHeight - 100}`;
    },
    eventClick(d, point) {
      d.tx = point[0];
      d.ty = point[1];
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      this.draw(d)
    }
  }
}
</script>
