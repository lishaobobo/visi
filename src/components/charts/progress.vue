<template>
  <div class="progress">
    <div class="content">
      <!-- <div class="tools">
        <input type="number" v-model="value" max="100" min="0" step="1" />
        <button @click="value -= 30">- 30</button>
        <button @click="value += 30">+ 30</button>
        <button @click="fontSize -= 10">font size -10</button>
        <button @click="fontSize += 10">font size +10</button>
        <button @click="progress.resize()">resize</button>
      </div> -->
      <div v-for="item in list" :key="item" ref="progress" class="chart-box"></div>
    </div>
  </div>
</template>
<script>
import Progress from "js/charts/progress";

export default {
  data() {
    return {
      value: 60,
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
      this.progress.update(this.value / 100);
    },
    fontSize(newValue) {
      this.progress.setOptions({
        titleStyle: { fontSize: newValue }
      });
    }
  },
  mounted() {
    let option = {
      name: "progress",
      el: this.$refs.progress,
      options: {
        value: 0.6,
        reverse: false,
        borderWidth: 10,
        textStyle: {
          fontSize: this.fontSize + "px",
          color: "#FFF"
        },
        allAngle: 210,
        offsetAngle: -105,
        startColor: '#3EAE89',
        endColor: '#3EAE89',
        trackColor: "#cccccc",
        changeEndCallback: value => {
          console.log('Tick end.');
        },
        textFormat: value => (`<tspan>${(value * 100).toFixed(2)}</tspan><tspan style='font-size:12px'>%</tspan>`)
      }
    };
    this.$nextTick(() => {
      this.list.forEach((item, i) => {
        option.el = this.$refs.progress[i]
        this.progress = new Progress(option);
        window.addEventListener("resize", () => {
          this.progress.resize();
        });
      })
    })
  },
  beforeDestroy() {
    this.progress.destroy();
    window.removeEventListener("resize", () => {
      this.progress.resize();
    });
  }
};
</script>
<style >
body {
  overflow: scroll;
}
.chart-box{
  width:400px;
  height:400px;
}
</style>