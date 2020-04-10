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
      res.length = 500;
      let data = this.processData(res);
      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => d);
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d['Data.process_id']))
        .force("charge", d3.forceManyBody().strength(-30))
        .force("x", d3.forceX())
        .force("y", d3.forceY())

      const svg = d3.select(this.$refs.svg).append('svg')
        .attr('width', width)
        .attr('height', height)
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

      const text = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr("fill", d3.scaleOrdinal(d3.schemeCategory10))
        .text(d => {
          let str = d['Data.process_name'] ? d['Data.process_name'].split('\n')[0] : ''
          return str;
        })
        .call(this.simulation(simulation));


      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);

        text.attr('x', d => d.x)
          .attr('y', d => d.y)
          .attr('transform',`translate(2,-2)`)
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

