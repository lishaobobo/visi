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
        name: 'root',
        children: []
      }
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
      let nodes = [];
      let root_map = {};
      for (let i = 0; i < data.length; i++) {
        let d = data[i];
        // 拿进程id等关联
        process_map[d[`Data.process_id`]] = d;

        nodes.push(d)

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
            nodes.push(root);
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


      let list = [];

      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const parent = process_map[d["Data.parent_process_id"]];
        if (!parent) continue;
        list.push({
          source: parent['Data.process_id'],
          target: d['Data.process_id'],
        });
      }

      return {
        nodes: nodes,
        links: list
      };
    },
    draw(res) {
      res.length = 1000;
      let data = this.processData(res);
      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => Object.create(d));
      const width = 1920;
      const height = 1000;
      const simulation = d3.forceSimulation(nodes)
        // .alpha(0.01)
        .force("link", d3.forceLink(links).id(d => d['Data.process_id']).distance(0).strength(1))
        .force("charge", d3.forceManyBody().strength(-5))
        .force('collision', d3.forceCollide(12).strength(1).iterations(100))
        // .force("link", d3.forceLink(links).id(d => d['Data.process_id']).distance(10))
        // .force("charge", d3.forceManyBody().strength(-4)) // 节点间的斥力,-值为相互排斥,+值为相互吸引
        .force("x", d3.forceX())
        .force("y", d3.forceY())

      const svg = d3.select(this.$refs.svg).append('svg')
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

      const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1)
        .attr('stroke', '#f00')

      const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d3.scaleOrdinal(d3.schemeCategory10))
        .call(this.simulation(simulation));

      node.append("title")
        .text(d => d.id);

      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
      // setTimeout(()=>{
      //   simulation.stop()
      // },2000);

    },
    simulation(simulation) {
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }
}
</script>

