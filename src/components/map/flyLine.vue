<template>
  <div style="background: rgba(0, 0, 0, 0.7);">
    <div style="width:100%;height:100vh" ref="dataRange"></div>
    <div
      :class="['map-title',isOverMap ? 'map-title-over' : '']"
      :style="mapTitlePositon"
    >{{mapName}}</div>
  </div>
</template>
<script>
import geoData from "../../common/json/china.json";
import Map3D from "../../common/js/map/Map3D";
import mook from "../../common/data/copyData";
import TWEEN from "@tweenjs/tween.js";
import _ from "lodash";
export default {
  data() {
    return {
      eventMap: {
        invasion: {
          layer: 1,
          color: "#FC0018"
        },
        scanning: {
          layer: 2,
          color: "#F1CA3F"
        },
        vulnerability: {
          layer: 3,
          color: "#10B1ED"
        },
        lowRisk: {
          layer: 4,
          color: "#C5FFFF"
        }
      },
      map: null,
      mapName: "",
      citys: [],
      citysCategory: {},
      citysCategoryUniq: [],
      mapTitlePositon: {
        left: "800px",
        top: "600px"
      },
      isOverMap: false,
      option: {
        name: "flyLine",
        el: "",
        debugger: false,
        geoData,
        area: {
          data: [],
          color: 0x42567c,
          lineColor: 0x1481ba,
          loadEffect: true,
          opacity: 1
        },
        mark: {
          data: []
        },
        line: {
          data: []
        },
        dataRange: {
          data: []
        },
        ring: {
          data: [],
          color: 0xd8d8d8,
          opacity: 0.8
        }
      }
    };
  },
  mounted() {
    this.option.el = this.$refs.dataRange;
    this.checkData();
    //添加区域数据
    geoData.features.forEach(item => {
      item.count = 0;
      item.mark = {};
      item.colors = [];
      item.typeList = [];
      //线数据
      // this.option.line.data.push({
      //   fromName: item.properties.name,
      //   toName: "北京",
      //   haloDensity: 10,
      //   hasHalo: true,
      //   hasHaloAnimate: false,
      //   spaceHeight: Math.random() * 20,
      //   color: 0x0dbdff,
      //   haloColor: 0x052659,
      //   haloSize: Math.random() * 10,
      //   coords: [item.properties.cp, [116.4551, 40.2539]],
      //   value: Math.random() * 7
      // });
    });
    this.init();
    this.map = new Map3D(this.option);
    let _me = this;
    this.map.setCameraPosition({ x: -2, y: -26, z: 30 }, 1000, 0);

    this.map.addEventListener("mousedown", event => {
      let obj = event.target;
      if (obj.type === "Area") {
        let data = [];
        let color = 0xff0000;
        geoData.features.forEach(i => {
          //线数据
          data.push({
            fromName: i.properties.name,
            toName: obj.name,
            haloDensity: 12,
            spaceHeight: 8,
            haloRunRate: 0.05,
            color: color,
            haloSize: 3,
            haloColor: 0xff0000,
            coords: [i.properties.cp, obj.userData.cp],
            value: Math.random() * 1
          });
        });
        data.push({
          fromName: obj.name,
          toName: obj.name,
          haloDensity: 10,
          spaceHeight: 10,
          haloRunRate: 0.5,
          color: color,
          haloSize: 12,
          coords: [obj.userData.cp, obj.userData.cp],
          value: Math.random() * 1
        });
        this.map.initLine({ data });
      }
      if (obj.type === "Mark") {
        this.eventTypeClick(obj);
      }
    });
    this.map.addEventListener("mouseover", event => {
      let obj = event.target;
      switch (obj.type) {
        case "Mark":
          _me.mapName = obj.userData.name;
          let box = obj.children[0];
          this.eventTypeOver(box, { x: 1.3, y: 1.3, z: 1.3 }, 200, 0);
          break;
        case "Area":
          _me.mapName = obj.userData.name;
          break;
        default:
          _me.mapName = obj.userData.name;
          break;
      }
      this.isOverMap = true;
      _me.mapTitlePositon.left =
        $(window).scrollLeft() + event.clientX + 20 + "px";
      _me.mapTitlePositon.top =
        $(window).scrollTop() + event.clientY + 20 + "px";
    });
    this.map.addEventListener("mouseout", event => {
      let obj = event.target;
      switch (obj.type) {
        case "Mark":
          _me.mapName = obj.userData.name;
          let box = obj.children[0];
          box.setScale({ x: 1, y: 1, z: 1 }, 200, 0);
          break;
        case "Area":
          break;
        default:
          // _me.mapName = obj.userData.name;
          break;
      }
      _me.isOverMap = false;
    });
  },
  methods: {
    /**
     *
     * 处理数据
     * citys => 那些省份有事件
     * citysCategory => 省份的所有事件列表
     * 给Map里的所有数据都添加一个属性,以便区分父子级关系
     *
     */
    checkData() {
      let arr = [].concat(mook.data);
      this.citys = _.uniqBy(arr, "name");
      this.citys.forEach(item => {
        this.citysCategory[`${item.name}`] = [];
      });
      Object.keys(this.citysCategory).forEach(item => {
        [].concat(mook.data).forEach(e => {
          if (e.name === item) {
            e.isParent = true;
            this.citysCategory[item].push(JSON.parse(JSON.stringify(e)));
          }
        });
      });
      let o = {};
      Object.keys(this.citysCategory).forEach(item => {
        o[item] = _.uniqBy([].concat(this.citysCategory[item]), "type");
        o[item].forEach((e, i) => {
          e.z = i * 0.7 + 1.3;
          e.color = this.eventMap[e.type].color;
          e.boxSize = 0.5;
          e.index = i;
          this.citysCategoryUniq.push(e);
        });
      });
    },
    /**
     *
     * 初始化数据
     *
     */
    init() {
      this.option.mark.data = [].concat(this.citysCategoryUniq);
      this.option.ring.data = [].concat(this.citys);
    },
    /**
     *
     * 事件类型mouseover回调
     * @param geo geometry
     * @param v3 {x:1,y:1,z:1}
     * @param time 动画完成时间
     * @param delay 动画延迟时间
     *
     */
    eventTypeOver(geo, v3, time, delay) {
      geo.setScale(v3, time, delay);
    },
    /**
     *
     * 时间类型mouseout回调
     * @param v3 {x:1,y:1,z:1}
     * @param time 动画完成时间
     * @param delay 动画延迟时间
     *
     */
    eventTypeOut(geo, v3, time, delay) {
      geo.setScale(v3, time, delay);
    },
    /**
     *
     * 事件类型click回调,将点击地区的分类数据,切换成单一类型所有事件数据
     * 保存点击的事件类型和地区名称
     * 删除该地区的所有事件,再拿到该地区该事件类型的所有时间,并push进数组里
     *
     */
    eventTypeClick(geo) {
      let name = geo.name;
      let type = geo.userData.type;
      let eventList = this.citysCategory[name].filter(
        item => item.type === type
      );
      eventList.forEach((item, index) => {
        item.z = index * 0.7 + 1.3;
        item.isParent = false;
        item.color = this.eventMap[type].color;
        item.boxSize = 0.5;
        item.index = index;
      });
      let arr = this.citysCategoryUniq.filter(item => item.name != name);
      this.citysCategoryUniq = arr.concat(eventList);
      this.map.mark.data = [];
      this.map.mark.data = [].concat(this.citysCategoryUniq);
      this.map.initMark();
    },
    /**
     *
     * 单一事件mouseover
     * 放大某个色块
     *
     */
    eventOver() {
      console.log("单一");
    },
    /**
     *
     * 重写过渡动画
     *
     */
    mapTransition(from, to, time, delay, easing, callback) {
      if (typeof time !== "number") {
        time = 1000;
      }
      if (!callback) callback = () => {};

      new TWEEN.Tween(from)
        .to(to, time)
        .delay(delay || 0)
        .easing(easing || TWEEN.Easing.Linear.None)
        .start()
        .onComplete(callback);
    }
  }
};
</script>

<style lang="scss" scoped>
.map-title {
  border-radius: 5px;
  border: 1px solid #ddd;
  color: #eee;
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  z-index: 2;
  opacity: 0;
  padding: 15px;
  text-align: center;
  transition: all 0.2s;
  pointer-events: none;
}

.map-title-over {
  opacity: 1;
}
</style>