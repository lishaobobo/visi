<template>
  <div class="dashboard" ref="dashboard"></div>
</template>
<script>
import Dashboard from "js/charts/dashboard";

export default {
  data() {
    return {
      value: 0.5
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
    }
  },
  mounted() {
    let dashboardOption = {
      name: "dashboard",
      el: this.$refs.dashboard,
      options: {
        value: 0.5,
        allAngle: 270,
        offsetAngle: -135,
        pointerColor: "rgb(255,159,12)",
        textColor: "rgb(255,159,12)",
        valueFormat: value => (value * 10).toFixed(1),
        progress: {
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
          showText: false,
          textFormat: value => `<tspan>${(value * 10).toFixed(1)}</tspan>`
        }
      }
    };
    this.$nextTick(() => {
      this.dashboard = new Dashboard(dashboardOption);
      window.addEventListener("resize", () => {
        this.dashboard.resize();
      });
    });

    // setTimeout(() => {
    //   this.dashboard.update(1)
    // }, 3000)
  },
  beforeDestroy() {
    this.dashboard.destroy();
    window.removeEventListener("resize", () => {
      this.dashboard.resize();
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