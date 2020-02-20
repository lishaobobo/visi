<template>
  <div class="pyramid">
    <div class="content">
      <div class="tools">
        space:
        <input type="number" v-model="space" step="1" />
        opacity:
        <input type="number" v-model="opacity" step="0.1" max="1" />
        <button @click="setOptions">setOptions</button>
      </div>
      <div class="chart-box" ref="pyramid" />
    </div>
  </div>
</template>
<script>
import Pyramid from "js/charts/pyramid";

export default {
  data() {
    return {
      space: 5,
      opacity: 0.9
    };
  },
  watch: {},
  mounted() {
    let option = {
      name: "pyramid",
      el: this.$refs.pyramid,
      data: [10, 20, 30, 40, 50, 60],
      legent: ["内容1", "内容2", "内容3", "内容4", "内容5", "内容6"],
      space: 5,
      opacity: this.opacity,
      width: 300,
      height: 300
    };
    this.pyramid = new Pyramid(option);
    window.addEventListener("resize", () => {
      this.pyramid.resize();
    });
  },
  methods: {
    setOptions() {
      this.pyramid.setOptions({
        space: this.space,
        opacity: this.opacity,
      });
    }
  }
};
</script>
