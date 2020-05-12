<template>
  <div class="dashboard">
    <div class="content">
      <div class="tools">
        <input type="number" v-model="value" max="100" min="0" step="1" />
        <button @click="value -= 30">- 30</button>
        <button @click="value += 30">+ 30</button>
        <button @click="fontSize -= 10">font size -10</button>
        <button @click="fontSize += 10">font size +10</button>
        <button @click="dashboard.resize()">resize</button>
      </div>
      <div v-for="item in list" :key="item" ref="dashboard" class="chart-box"></div>
    </div>
  </div>
</template>
<script>
import Dashboard from "js/charts/dashboard";

export default {
  data() {
    return {
      value: 100,
      fontSize: 40,
      list: [1]
    };
  },
  watch: {
    value(newValue) {
      if (newValue > 100) {
        this.value = 100;
        return;
      }
      if (newValue < 0) {
        this.value = 0;
        return;
      }
      this.dashboard.update(this.value / 100);
    },
    fontSize(newValue) {
      this.dashboard.setOptions({
        titleStyle: { fontSize: newValue }
      });
    }
  },
  mounted() {
    let option = {
      name: "dashboard",
      el: this.$refs.dashboard,
      options: {
        value: 1,
        reverse: false,
        borderWidth: 10,
        textStyle: {
          fontSize: this.fontSize + "px",
          color: "#FFF"
        },
        splitConut: 3,
        startColor: '#f00',
        endColor: '#ff0',
        trackColor: "#cccccc",
        allAngle: 360,
        offsetAngle: 0,
        changeEndCallback: value => {
          console.log('Tick end.');
        },
        textFormat: value => (`<tspan>${(value * 100).toFixed(2)}</tspan><tspan style='font-size:12px'>%</tspan>`)
      }
    };
    this.$nextTick(() => {
      this.list.forEach((item, i) => {
        option.el = this.$refs.dashboard[i]
        this.dashboard = new Dashboard(option);
        window.addEventListener("resize", () => {
          this.dashboard.resize();
        });
      })

    })
  }
};
</script>
<style >
body {
  overflow: scroll;
}
</style>