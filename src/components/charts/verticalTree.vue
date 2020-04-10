<template>
  <div ref="svg" class="tree"></div>
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
      width: 1920
    }
  },
  mounted() {
    d3.csv('/assets/csv/all.csv').then((res) => {
      delete res.columns;
      this.draw(_.uniqBy(res, 'Data.process_id'));
    })
  },
  methods: {
    processData(data) {
      let process_map = {};
      let root_map = {};
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        // 拿进程id等关联
        process_map[d[`Data.process_id`]] = d;

        // 找到root
        if (d[`Data.parent_process_id`] === d[`Data.root_process_id`]) {
          let root_process_id = d[`Data.root_process_id`];
          let root = {
            "Data.process_id": root_process_id,
            "Data.process_name": d["Data.root_process_name"],
            "Data.process_path": d["Data.root_process_path"],
          };
          if (!root_map[root_process_id]) {
            root_map[root_process_id] = root;
          }

          if (!process_map[root_process_id]) {
            process_map[root_process_id] = root;
          }
        }
      }

      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const parent = process_map[d["Data.parent_process_id"]];
        if (!parent) {
          continue
        };
        if (!parent.children) parent.children = [];
        parent && parent.children.push(d);
      }
      Object.keys(process_map).forEach(item => {
        this.csvData.children.push(process_map[item])
      })
      return this.csvData;
    },
    draw(res) {
      res.length = 100
      let data = this.processData(res);

      const root = this.tree(data);

      let x0 = Infinity;
      let x1 = -x0;
      root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      const svg = d3.select(this.$refs.svg).append('svg')
        .attr('width', this.width)
        .attr('height', 1000)

      const g = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(${0},${30})`);

      const link = g.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3
          .linkVertical()
          .source((d) => [d.source.x, d.source.y + 12])
          .target((d) => [d.target.x, d.target.y - 12]));

      const node = g.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr(
          "transform",
          (d) => `translate(${Math.round(d.x)},${Math.round(d.y)})`
        );

      node.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 2.5);

      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => {
          let str = d.data['Data.process_id'] ? d.data['Data.process_id'].split('\n')[0] : d.data['Data.process_id'] === 'root' ? 'root' : ''
          return str
        })
        .clone(true).lower()
        .attr("stroke", "white");
    },
    tree(data) {
      return d3
        .tree()
        .size([this.width - 20 * 2, 800 - 20 * 2])
        .separation(() => 1)(d3.hierarchy(data))
    }
  }
}
</script>

