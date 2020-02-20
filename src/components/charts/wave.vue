<template>
  <div class="wave">
    <div class="content">
      <div class="tools">
        <input type="number" v-model="value" max="100" min="0" step="1" />
        <button @click="value -= 30">- 30</button>
        <button @click="value += 30">+ 30</button>
        <button @click="fontSize -= 10">font size -10</button>
        <button @click="fontSize += 10">font size +10</button>
        <button @click="wave.resize()">resize</button>
      </div>
      <div class="chart-box" ref="wave" />
    </div>
  </div>
</template>
<script>
import Wave from "js/charts/wave";

export default {
  data() {
    return {
      value: 50,
      fontSize: 40,
    };
  },
  watch: {
    value(newValue) {
      this.value = newValue > 100 ? 100 : newValue < 0 ? 0 : newValue
      this.wave.update(this.value / 100);
    },
    fontSize(newValue) {
      this.wave.setOptions({
        textStyle: { fontSize: newValue }
      });
    }
  },
  mounted() {
    let option = {
      name: "wave",
      el: this.$refs.wave,
      value: 0.5,
    };
    this.wave = new Wave(option);
    window.addEventListener("resize", () => {
      this.wave.resize();
    });
  }
};
</script>
