<template>
  <div class="dashboard">
    <div class="dashboard--progress" ref="progress"></div>
    <div class="dashboard--main" ref="dashboard"></div>
  </div>
</template>
<script>
import Progress from "js/charts/progress";
import Dashboard from "js/charts/dashboard";

export default {
  data() {
    return {
      value: 100,
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
        value: 0.5,

        startColor: "rgb(255,197,128)",
        endColor: "rgb(255,159,12)",
        trackColor: "rgb(249,242,234)",
        fullIsHideCircle: false,

        reverse: false,
        borderWidth: 20,
        textStyle: {
          fontSize: this.fontSize + "px",
          color: "#FFF"
        },
        splitConut: 5,
        showDot: false,
        allAngle: 270,
        offsetAngle: -135,
        innerCircleScale: 1.2,
        innerCircleFill: "rgba(248,251,255,1)",
        changeEndCallback: value => {
          console.log("Tick end.");
        },
        textFormat: value => `<tspan>${(value * 10).toFixed(1)}</tspan>`
      }
    };
    let dashboardOption = {
      name: "dashboard",
      el: this.$refs.dashboard,
      options: {
        value: 0.5,
        allAngle: 270,
        offsetAngle: -135,
      }
    };
    this.$nextTick(() => {
      option.el = this.$refs.progress;
      this.progress = new Progress(option);
      this.dashboard = new Dashboard(dashboardOption);
      window.addEventListener("resize", () => {
        this.progress.resize();
      });
    });
  }
};
</script>
<style >
body {
  overflow: scroll;
}
.dashboard-title {
  fill: #000;
}
.dashboard {
  width: 350px;
  height: 350px;
  position: relative;
}
.dashboard--progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 50px;
  box-sizing: border-box;
}
.dashboard--main {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>