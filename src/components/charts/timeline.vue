<template>
  <div class="timeline">
    <div ref="timeline"></div>
  </div>
</template>
<script>
import * as d3 from "d3";
import $ from "jquery";
import data from '../../common/json/timeline.json'

export default {
  data() {
    return {
      svg: null,
      width: null,
      height: null,
      count: 10,
      index: 0,
      margin: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
      },
      padding: 15,
      strokeWidth: 2,
      level: 0,
      infoList: [],
      actionList: [],
      svgChange: false
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
      this.rectHeight = this.height / this.count;
      this.end = data.basic.main_end_time * 1000;
      this.start = data.basic.main_start_time * 1000;
      this.render()
    },
    addXAxis() {
      this.XScale = d3.scaleTime()
        .domain([this.start, this.end])
        .range([this.margin.left, this.width - this.margin.right]);
      //下X轴
      this.svg.append("g")
        .call(d3.axisBottom(this.XScale).ticks(this.width / 100).tickFormat(d3.timeFormat("%d,%I")))
        .attr("font-size", 12)
        .attr("font-family", "-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif")
        .attr("transform", `translate(0, ${this.height - 40})`);

      // 上x轴
      this.svg.append("g")
        .call(d3.axisTop(this.XScale).ticks(this.width / 100).tickFormat(d3.timeFormat("%d,%I")))
        .attr("font-size", 12)
        .attr("font-family", "-apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif")
        .attr("transform", `translate(0, 40)`);
    },
    addRect() {
      this.reset()
      let _me = this;
      let arr = data.process;
      for (let i = 0; i < arr.length; i++) {
        if (this.index >= this.count) break;
        arr[i].level = this.level
        getPoints(arr[i]);
      }
      // 递归遍历数据,计算起始点坐标
      function getPoints(item) {
        let { base_info, actions } = item;
        let start = base_info.process_birth_time ? base_info.process_birth_time * 1000 : _me.start;
        let end = base_info.process_terminate_time ? base_info.process_terminate_time * 1000 : _me.end;

        let point = {
          x: _me.XScale(start),
          y: _me.index * (_me.rectHeight + _me.padding) + _me.margin.top
        }
        // 渲染进程
        let rectG = _me.svg.append('g')
        rectG.append('rect')
          .datum(item)
          .attr('x', point.x)
          .attr('y', point.y)
          .attr('width', _me.XScale(end) - _me.XScale(start))
          .attr('height', _me.rectHeight)
          .attr('fill', d3.schemeCategory10[_me.level])
          .attr('class', base_info.process_name)
          .style('cursor', 'pointer')
          .on('click', (d)=>{
            let o = JSON.parse(JSON.stringify(item));
            delete o.level;
            delete o.childs;
            Object.keys(o).forEach(current => {
              if (current === 'base_info') {
                o[current].showAll = true;
                _me.infoList.push(o[current]);
              } else {
                o[current].forEach(ele => {
                  _me.infoList.push(ele);
                })
              }
            })
            if (!_me.svgChange) {
              _me.width -= 400;
              _me.render()
              _me.svgChange = true;
            }
            _me.tooltip.style('display', 'block')
            _me.flatList()
          })
        let fontSize = 12;
        let offsetX = 5;
        rectG.append('text')
          .attr('font-size', fontSize)
          .attr('fill', '#f00')
          .text(`${item.base_info.process_name}`)
          .attr('x', point.x + offsetX)
          .attr('y', point.y + _me.rectHeight + fontSize)
          .attr('text-anchor', textPosition(item.base_info.process_name, start))

        // 计算文字位置
        function textPosition(name, start) {
          _me.svg.append('text')
            .attr('class', 'textBox')
            .attr('transform', 'translate(-300,-300)')
            .text(name);
          let { width } = document.querySelector('.textBox').getBoundingClientRect()
          d3.selectAll('.textBox').remove();
          if (_me.XScale(start) + width >= _me.XScale(_me.end)) {
            return 'end'
          }
          return 'start'
        }

        // 渲染actions
        for (let k = 0; k < actions.length; k++) {
          let { event_time, name } = actions[k];
          _me.svg.append('circle')
            .datum(actions[k])
            .attr('cx', _me.XScale(event_time * 1000))
            .attr('cy', point.y + _me.rectHeight / 2)
            .attr('r', 5)
            .attr('fill', d3.schemeDark2[k])
            .attr('class', name)
            .style('cursor', 'pointer')
            .on('click', d => {
              _me.infoList.push(d);
              _me.flatList()
              _me.tooltip.style('display', 'block')
            })
            .on('mouseenter', function () {
              d3.select(this)
                .transition()
                .duration(300)
                .attr('r', 8)
                .attr('fill', 'blue')
            })
            .on('mouseleave', function () {
              d3.select(this)
                .transition()
                .duration(300)
                .attr('r', 5)
                .attr('fill', d3.schemeDark2[k])
            })
        }

        // 渲染link
        if (item.source) {
          let { source } = item;
          _me.svg.append('polyline')
            .attr('points', `${source.x + _me.strokeWidth},${source.y} ${source.x + _me.strokeWidth},${source.y + _me.padding + _me.rectHeight / 2} ${point.x},${point.y + _me.rectHeight / 2}`)
            .attr('stroke', d3.schemeCategory10[_me.level])
            .attr('fill', 'none')
            .attr('stroke-width', _me.strokeWidth)
        }
        _me.index++;
        if (!item.childs || !item.childs.length) return;
        _me.level++
        let arr = item.childs;
        let len = arr.length;
        for (let i = 0; i < len; i++) {
          arr[i].source = {
            x: point.x,
            y: point.y + _me.rectHeight
          }
          arr[i].level = _me.level
          getPoints(arr[i]);
        }
      };
    },
    addCount() {
      d3.select('.add').remove()
      this.plus = d3.select('.timeline')
        .append('div')
        .attr('class', 'add')
        .style('top', `${document.querySelector('.timeline_svg').getBoundingClientRect().height - 100}px`)
        .on('click', () => {
          this.count += 10;
          this.addRect();
        });
    },
    reset() {
      this.svg.selectAll('rect').remove();
      this.svg.selectAll('polyline').remove();
      this.level = 0;
      this.index = 0;
    },
    addInfoTooltip() {
      d3.select('.infoToolTip').remove()
      this.tooltip = d3.select('.timeline').append('div')
        .attr('class', 'infoToolTip')
      this.tooltip.append('p').attr('class', 'delete').on('click', () => {
        this.infoList = [];
        if (this.svgChange) {
          this.width += 400;
          this.render()
          this.svgChange = false;
        }
        this.tooltip.style('display', 'none').selectAll('div').remove()
      })
    },
    flatList() {
      let len = this.infoList.length
      for (let i = 0; i < len; i++) {
        this.getInfo(this.infoList[i])
      }
    },
    getInfo(item) {
      let container = this.tooltip.append('div').attr('class', 'infoDetail');
      let title = container.append('div').attr('class', 'details_title');
      if (item.showAll) {
        title.html(`${item.process_name}`);
        Object.keys(item).forEach(ele => {
          container.append('p')
            .text(`${ele}:   ${item[ele]}`)
        })
      } else {
        title.html('子进程');
        let p = container.append('p')
          .datum(item)
          .attr('class', 'child_progress')
          .on('click', function (d) {
            let p = d3.select(this);
            //找到arrow的span
            let span = d3.select(this)
              .select('span');
            //拿到class
            let arrowD = span.attr('class');
            //删除原calss
            span.classed(arrowD, false);
            if (arrowD === 'info_arrow') {
              recursive(d)
            } else {
              container.selectAll('.action_info')
                .remove()
            }
            //添加新class
            span.classed(arrowD === 'info_arrow_down' ? 'info_arrow' : 'info_arrow_down', true);

            function recursive(o) {
              Object.keys(o).forEach(str => {
                if (typeof o[str] === 'object') {
                  recursive(o[str])
                } else {
                  container.append('div')
                    .style('background-color', 'green')
                    .attr('class', 'action_info')
                    .text(`${str}:   ${o[str]}`)
                }
              })
            }
          });
        p.append('span')
          .attr('class', 'info_arrow')
        p.append('span')
          .text(`${item.name}`)
      }
    },
    render() {
      d3.select(this.$refs.timeline).selectAll('*').remove();
      this.svg = d3.select(this.$refs.timeline)
        .style('background-color', '#aaa')
        .append('svg')
        .attr('class', 'timeline_svg')
        .attr('width', this.width)
        .attr('height', this.height)
      this.addXAxis();
      this.addRect();
      this.addCount();
      this.addInfoTooltip()
    }
  }
};
</script>
<style lang="css">
.timeline {
  display: flex;
}
.add {
  width: 100px;
  height: 100px;
  color: #ccc;
  transition: color 0.25s;
  position: absolute;
  transform: scale(0.5);
  left: 50px;
  cursor: pointer;
}

.add::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80px;
  margin-left: -40px;
  margin-top: -5px;
  border-top: 10px solid;
}

.add::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  height: 80px;
  margin-left: -5px;
  margin-top: -40px;
  border-left: 10px solid;
}
.add:hover {
  color: green;
}
.infoToolTip {
  width: 400px;
  max-height: 100vh;
  overflow: scroll;
  border-radius: 5px;
  display: none;
}

.infoToolTip .delete {
  width: 50px;
  height: 50px;
  position: absolute;
  right: 0;
  top: 0;
}

.infoToolTip .delete::before,
.infoToolTip .delete::after {
  content: "";
  position: absolute; /*方便进行定位*/
  background-color: #aaa;
  height: 25px;
  width: 2px;
  top: 50%;
  left: 50%;
  margin-top: -15px;
  margin-left: -1px;
}
.infoToolTip .delete::before {
  transform: rotate(45deg); /*进行旋转*/
}
.infoToolTip .delete::after {
  transform: rotate(-45deg);
}
.infoDetail {
  width: 100%;
  margin-top: 10px;
  word-break: break-word;
  padding: 10px;
}

.details_title {
  border-bottom: 1px solid #bbb;
  font-weight: 800;
  font-size: 16px;
  height: 30px;
  line-height: 30px;
}
.child_progress {
  background-color: seagreen;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 30px;
}
.child_progress span {
  display: inline-block;
}
.info_arrow {
  width: 7px;
  height: 7px;
  border-top: 2px solid #ffffff;
  border-right: 2px solid #ffffff;
  transform: rotate(45deg);
  margin-right: 10px;
  margin-left: 10px;
}
.info_arrow_down {
  width: 7px;
  height: 7px;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(-45deg);
  margin-right: 10px;
  margin-left: 10px;
  margin-top: -3.5px;
}
</style>