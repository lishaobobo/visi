<template>
  <div style='background: rgba(0, 0, 0, 0.7);'>
    <div style="width:100%;height:100vh" ref="dataRange"></div>
  </div>
</template>
<script>
import geoData from "../../common/json/china.json";
import Map3D from "../../common/js/map/Map3D";
export default {
  data() {
    return {};
  },
  mounted() {
    let option = {
      name: "dataRange",
      el: this.$refs.dataRange,
      debugger: false,
      geoData,
      area: {
        data: [],
        color: 0x052659,
        lineColor: 0x1481ba,
        loadEffect: true
      },
      mark: {
        data: [],
        color: 0xffffff
      },
      line: {
        data: []
      },
      dataRange: {
        data: [
          { name: "高", min: 90, color: 0x0066e4 },
          { name: "高", min: 80, max: 90, color: 0x207be6 },
          { name: "中", min: 60, max: 80, color: 0x329de8 },
          { name: "低", max: 60, min: 30, color: 0x66b6fd }
        ]
      }
    };
    //添加区域数据
    geoData.features.forEach(item => {
      //线数据
      option.area.data.push({
        name: item.properties.name,
        value: Math.random() * 100,
        color: 0x3399ff
      });
    });

    let map = new Map3D(option);
    let _me = this;
    map.setCameraPosition({ x: -2, y: -26, z: 30 }, 1000, 300);

    map.addEventListener("mouseover", event => {
      let obj = event.target;
      switch (obj.type) {
        case "Line":
          _me.mapName = obj.userData.fromName + "-" + obj.userData.toName;
          break;
        case "Mark":
          break;
        case "DataRange":
          _me.mapName =
            obj.userData.name +
            ":" +
            (obj.userData.min || "") +
            "-" +
            (obj.userData.max || "");
          break;
        case "Area":
          _me.mapName = obj.userData.name;
          break;
        default:
          _me.mapName = obj.userData.name;
          break;
      }
    });
  }
};
</script>

