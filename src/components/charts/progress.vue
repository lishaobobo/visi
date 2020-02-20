<template>
  <div class="progress">
    <div class="content">
      <div class="tools">
        <input type="number" v-model="value" max="100" min="0" step="1" />
        <button @click="value -= 30">- 30</button>
        <button @click="value += 30">+ 30</button>
        <button @click="fontSize -= 10">font size -10</button>
        <button @click="fontSize += 10">font size +10</button>
        <button @click="progress.resize()">resize</button>
      </div>
      <div class="chart-box" ref="progress" />
    </div>
  </div>
</template>
<script>
import Progress from "js/charts/progress";

export default {
  data() {
    return {
      value: 60,
      fontSize: 40
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
        borderWidth: 9,
        titleStyle: {
          fontSize: this.fontSize + "px",
          color: "#000000"
        },
        trackColor: "#cccccc",
        changeEndCallback: value => {
          console.log(value);
        }
      }
    };
    this.progress = new Progress(option);
    window.addEventListener("resize", () => {
      this.progress.resize();
    });
  }
};
</script>
